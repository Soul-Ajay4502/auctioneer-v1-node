import { AppError } from '../utils/app-error.js'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { catchAsync } from '../utils/catch-async.js'
import User from '../../db/models/user.js'
import { ROLES } from '../constants/roles.js'
import { Op } from 'sequelize'
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js'
import { passwordUtils } from '../utils/password.util.js'

// Utility function to set refresh token cookie
const setRefreshTokenCookie = (res, token) => {
    res.cookie('refresh_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        path: '/',
    })
    return res
}

// Utility function to clear refresh token cookie
const clearRefreshTokenCookie = (res) => {
    res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
    })
    return res
}

const generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRY,
    })
}
const generateRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRY,
    })
}

const signup = catchAsync(async (req, res, next) => {
    const body = req.body

    // Validate user type
    if (![ROLES.SUPER_ADMIN, ROLES.MEMBER].includes(parseInt(body.userType))) {
        throw new AppError('Invalid user type', 400)
    }

    // Check if email already exists among VERIFIED users only
    const existingVerifiedUser = await User.findOne({
        where: {
            email: body.email,
            is_verified: true,
        },
    })

    if (existingVerifiedUser) {
        return next(new AppError('Email already in use', 400))
    }

    // Delete any existing unverified users with this email
    await User.destroy({
        where: {
            email: body.email,
            is_verified: false,
        },
        force: true, // Permanently delete
    })

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000)
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000)

    // Create temporary unverified user
    const tempUser = await User.create({
        user_type: body.userType,
        first_name: body.firstName,
        last_name: body.lastName,
        email: body.email,
        password: body.password,
        confirm_password: body.confirmPassword,
        verification_code: verificationCode,
        verification_code_expires_at: verificationExpiry,
        is_verified: false,
    })

    if (!tempUser) {
        return next(new AppError('Failed to create temporary user', 400))
    }

    // Send verification email
    try {
        await sendVerificationEmail(body.email, verificationCode)
        console.log('Verification email sent successfully')
    } catch (error) {
        console.error('Failed to send verification email:', error)
        // Delete the temporary user if email fails
        await User.destroy({ where: { id: tempUser.id }, force: true })
        return next(new AppError('Failed to send verification email', 500))
    }

    return res.status(201).json({
        status: 'success',
        message: 'Please check your email for verification code. Code expires in 15 minutes.',
        email: tempUser.email,
    })
})

const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body

    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400))
    }

    const user = await User.scope('withPassword').findOne({
        where: {
            email,
            is_verified: true, // Only allow verified users to login
        },
    })

    if (!user) {
        return next(new AppError('Incorrect email or password', 401))
    }

    const isPasswordValid = await passwordUtils.comparePasswords(password, user.password)
    if (!isPasswordValid) {
        return next(new AppError('Incorrect email or password', 401))
    }

    // Generate tokens with proper payload
    const tokenPayload = {
        id: user.id,
        user_type: user.user_type,
        isAdmin: user.user_type === ROLES.SUPER_ADMIN,
        is_verified: user.is_verified,
    }

    const accessToken = generateAccessToken(tokenPayload)
    const refreshToken = generateRefreshToken(tokenPayload)

    await User.update({ refresh_token: refreshToken }, { where: { id: user.id } })

    // Set refresh token cookie
    setRefreshTokenCookie(res, refreshToken)

    // Create sanitized user object
    const userResponse = {
        id: user.id,
        email: user.email,
        name: user.display_name,
        user_type: user.user_type,
        is_verified: user.is_verified,
        isAdmin: user.user_type == ROLES.SUPER_ADMIN,
    }

    return res.status(200).json({
        status: 'success',
        user: userResponse,
        accessToken,
    })
})

const logout = catchAsync(async (req, res) => {
    const userId = req.user?.id
    let logoutSuccess = false

    const refreshToken = req.cookies?.refresh_token

    if (userId) {
        const result = await User.update({ refresh_token: null }, { where: { id: userId } })
        console.log('logout result', result)
        logoutSuccess = result[0] > 0
    } else if (refreshToken) {
        // If no user ID but we have a refresh token cookie, invalidate by token
        const result = await User.update({ refresh_token: null }, { where: { refresh_token: refreshToken } })
        logoutSuccess = result[0] > 0
    }

    // Clear the refresh token cookie using utility function
    clearRefreshTokenCookie(res)

    res.status(200).json({
        status: 'success',
        message: 'You logged out successfully.',
        logoutSuccess,
    })
})

const refresh = catchAsync(async (req, res, next) => {
    // Get refresh token from cookie instead of request body
    const refreshToken = req.cookies.refresh_token

    if (!refreshToken) {
        return next(new AppError('You are not authenticated!', 401))
    }

    // Find user with this refresh token in the database
    const user = await User.findOne({
        where: { refresh_token: refreshToken },
    })

    if (!user) {
        return next(new AppError('Refresh Token is not valid or has expired!', 403))
    }

    // Verify the token
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)

        // Generate new tokens
        const payload = {
            id: decoded.id,
            user_type: decoded.user_type || user.user_type, // Fallback to user's type if not in token
            isAdmin: decoded.user_type === ROLES.SUPER_ADMIN || user.user_type === ROLES.SUPER_ADMIN,
        }

        const newAccessToken = generateAccessToken(payload)
        const newRefreshToken = generateRefreshToken(payload)

        // Update the refresh token in the database
        await User.update({ refresh_token: newRefreshToken }, { where: { id: user.id } })

        // Set refresh token cookie using utility function
        setRefreshTokenCookie(res, newRefreshToken)

        // Create user object with user details
        const userObj = {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            user_type: user.user_type,
            is_verified: user.is_verified,
            isAdmin: user.user_type === ROLES.SUPER_ADMIN,
        }

        return res.status(200).json({
            status: 'success',
            user: userObj,
            accessToken: newAccessToken,
        })
    } catch (error) {
        // Clear invalid token
        await User.update({ refresh_token: null }, { where: { id: user.id } })

        // Clear refresh token cookie using utility function
        clearRefreshTokenCookie(res)

        return next(new AppError('Invalid or expired refresh token', 403))
    }
})

const authentication = catchAsync(async (req, _, next) => {
    let idToken = ''
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        idToken = req.headers.authorization.split(' ')[1]
    } else if (req.cookies?.auth?.accessToken) {
        idToken = req.cookies.auth.accessToken
    }

    if (!idToken) {
        return next(new AppError('Please login to get access', 401))
    }

    try {
        // 2. token verification
        const tokenDetail = jwt.verify(idToken, process.env.JWT_ACCESS_SECRET)

        // 3. get the user detail from db and add to req object
        const freshUser = await User.findByPk(tokenDetail.id, {
            attributes: { exclude: ['password', 'created_at', 'updated_at', 'deleted_at'] },
        })

        if (!freshUser) {
            return next(new AppError('User no longer exists', 401))
        }

        // 4. Add user to request object
        req.user = freshUser
        return next()
    } catch (error) {
        return next(new AppError('Invalid or expired access token. Please log in again.', 401))
    }
})

const verifyEmail = catchAsync(async (req, res, next) => {
    const { email, code } = req.body

    if (!email || !code) {
        return next(new AppError('Please provide email and verification code', 400))
    }

    // Find the temporary unverified user
    const user = await User.findOne({
        where: {
            email,
            verification_code: code,
            is_verified: false,
            verification_code_expires_at: {
                [Op.gt]: new Date(),
            },
        },
    })

    if (!user) {
        return next(new AppError('Invalid or expired verification code', 400))
    }

    // Check again if email is taken by a verified user (race condition check)
    const existingVerifiedUser = await User.findOne({
        where: {
            email,
            is_verified: true,
        },
    })

    if (existingVerifiedUser) {
        // Delete the temporary user
        await User.destroy({ where: { id: user.id }, force: true })
        return next(new AppError('Email already in use', 400))
    }

    // Update user verification status
    await User.update(
        {
            is_verified: true,
            verification_code: null,
            verification_code_expires_at: null,
        },
        { where: { id: user.id } }
    )

    // Generate tokens with verified status
    const tokenPayload = {
        id: user.id,
        user_type: user.user_type,
        isAdmin: user.user_type === ROLES.SUPER_ADMIN,
        is_verified: true,
    }

    const accessToken = generateAccessToken(tokenPayload)
    const refreshToken = generateRefreshToken(tokenPayload)

    // Update refresh token
    await User.update({ refresh_token: refreshToken }, { where: { id: user.id } })

    // Set refresh token cookie using utility function
    setRefreshTokenCookie(res, refreshToken)

    // Create user object with user details
    const userObj = {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        user_type: user.user_type,
        is_verified: true,
        isAdmin: user.user_type === ROLES.SUPER_ADMIN,
    }

    return res.status(200).json({
        status: 'success',
        message: 'Email verified successfully. Account creation complete.',
        user: userObj,
        accessToken,
    })
})

const resendVerificationCode = catchAsync(async (req, res, next) => {
    const { email } = req.body

    if (!email) {
        return next(new AppError('Please provide email', 400))
    }

    const user = await User.findOne({
        where: {
            email,
            is_verified: false,
        },
    })

    if (!user) {
        return next(new AppError('User not found or already verified', 400))
    }

    // Generate new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000)
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000)

    // Update user with new verification code
    await User.update(
        {
            verification_code: verificationCode,
            verification_code_expires_at: verificationExpiry,
        },
        { where: { id: user.id } }
    )

    // Send new verification email
    try {
        await sendVerificationEmail(email, verificationCode)
        console.log('New verification email sent successfully')
    } catch (error) {
        console.error('Failed to send verification email:', error)
        // Continue even if email fails
    }

    return res.status(200).json({
        status: 'success',
        message: 'New verification code sent. Please check your email. Code expires in 15 minutes.',
    })
})

const forgotPassword = catchAsync(async (req, res, next) => {
    try {
        const { email } = req.body
        // Find user by email
        const user = await User.findOne({ where: { email: email } })
        if (!user) {
            // Don't reveal if user exists or not (security best practice)
            return res.status(200).json({
                success: true,
                message: 'If your email exists in our system, you will receive a password reset link.',
            })
        }

        // Generate reset token (expires in 1 hour)
        const resetToken = crypto.randomBytes(32).toString('hex')

        // Hash the token for security before storing it
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

        // Save the token to the user record
        await User.update(
            {
                verification_code: hashedToken,
                verification_code_expires_at: Date.now() + 3600000, // 1 hour
            },
            {
                where: { email: email },
            }
        )

        console.log('user email', user.email)
        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`

        // Send email
        await sendPasswordResetEmail(user.email, resetToken, resetUrl)

        res.status(200).json({
            success: true,
            message: 'If your email exists in our system, you will receive a password reset link.',
        })
    } catch (error) {
        console.error('Password reset error:', error)
        res.status(500).json({
            success: false,
            message: 'An error occurred while processing your request.',
        })
    }
})

const resetPassword = catchAsync(async (req, res, next) => {
    const { password, token } = req.body

    if (!password || !token) {
        return next(new AppError('Please provide password and token', 400))
    }

    // Validate password complexity
    try {
        passwordUtils.validatePassword(password)
    } catch (error) {
        return next(error)
    }

    // Hash the token from URL to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    const user = await User.findOne({
        where: {
            verification_code: hashedToken,
            verification_code_expires_at: {
                [Op.gt]: new Date(),
            },
        },
    })

    if (!user) {
        return next(new AppError('Password reset token is invalid or has expired', 400))
    }

    try {
        await User.update(
            {
                password: password, // Will be hashed by hooks
                verification_code: null,
                verification_code_expires_at: null,
            },
            {
                where: { id: user.id },
                individualHooks: true, // Important: This ensures hooks are run
            }
        )

        // Invalidate all existing sessions
        await User.update(
            {
                refresh_token: null,
            },
            {
                where: { id: user.id },
            }
        )

        return res.status(200).json({
            status: 'success',
            message: 'Password has been reset successfully. Please login with your new password.',
        })
    } catch (error) {
        console.error('Password reset error:', error)
        return next(new AppError('Failed to reset password', 500))
    }
})

export {
    signup,
    login,
    logout,
    refresh,
    authentication,
    verifyEmail,
    resendVerificationCode,
    forgotPassword,
    resetPassword,
    setRefreshTokenCookie,
    clearRefreshTokenCookie,
}
