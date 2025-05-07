import bcrypt from 'bcrypt'
import { AppError } from './app-error.js'

const SALT_ROUNDS = 10

export const passwordUtils = {
    validatePassword(password) {
        if (!password || password.length < 8) {
            throw new AppError('Password must be at least 8 characters long', 400)
        }

        // Add more validation rules as needed
        const hasUpperCase = /[A-Z]/.test(password)
        const hasLowerCase = /[a-z]/.test(password)
        const hasNumbers = /\d/.test(password)
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

        if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
            throw new AppError(
                'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
                400,
            )
        }
    },

    async hashPassword(password) {
        return bcrypt.hash(password, SALT_ROUNDS)
    },

    async comparePasswords(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword)
    },
}
