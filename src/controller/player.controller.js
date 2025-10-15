'use strict'
import { PlayerDetail, League, Team } from '../../db/models/index.js'
import { AppError } from '../utils/app-error.js'
import { Op } from 'sequelize'
import { getPaginationParams, paginatedQuery } from '../utils/pagination.utils.js'
import { catchAsync } from '../utils/catch-async.js'
import { sendVerificationEmail } from '../utils/email.js'
import { generateAccessToken } from './auth.controller.js'

export const playerController = {
    // Create a new player
    create: async (req, res, next) => {
        try {
            const playerData = req.body

            // Check if the league exists
            if (playerData.league_id) {
                const league = await League.findByPk(playerData.league_id)
                if (!league) {
                    return next(new AppError('No league found with that ID', 404))
                }
            }

            const existingPlayer = await PlayerDetail.findOne({
                where: {
                    email: playerData.email,
                    league_id: playerData.league_id,
                },
            })

            if (existingPlayer) {
                return next(new AppError('Player with this details already exists for this league', 400))
            }

            const player = await PlayerDetail.create(playerData)

            return res.status(201).json({
                status: 'success',
                data: {
                    player,
                },
            })
        } catch (error) {
            return next(new AppError(error, 400))
        }
    },

    // Get all players
    getAll: async (req, res, next) => {
        try {
            const { league_id, team_id, is_unsold, player_role } = req.query
            const paginationRequestData = getPaginationParams(req.query)

            let whereClause = {}

            if (league_id) {
                whereClause.league_id = league_id
            }

            if (team_id) {
                whereClause.sold_to = team_id
            }

            if (is_unsold) {
                whereClause.is_unsold = is_unsold
            }

            if (player_role) {
                whereClause.player_role = player_role
            }
            //         const { data: projects, pagination } = await paginatedQuery(
            //     Project,
            //     {
            //         where: whereConditions,
            //         include: [
            //             {
            //                 model: Status,
            //                 attributes: ['id', 'short_code'],
            //             },
            //         ],
            //         attributes: ['id', 'name'],
            //         order: [['created_at', 'DESC']],
            //     },
            //     paginationRequestData,
            // )

            const { data: players, pagination } = await paginatedQuery(
                PlayerDetail,
                {
                    where: whereClause,
                    include: [
                        {
                            model: League,
                            as: 'league',
                            attributes: ['league_id', 'league_name'],
                        },
                        {
                            model: Team,
                            as: 'team',
                            attributes: ['id', 'team_name', 'team_owner'],
                        },
                    ],
                },
                paginationRequestData,
            )

            return res.status(200).json({
                status: 'success',
                results: players?.length,
                data: players,
                pagination: pagination,
            })
        } catch (error) {
            next(error)
        }
    },

    // Get a specific player by ID
    getOne: async (req, res, next) => {
        try {
            const { id } = req.params

            const player = await PlayerDetail.findByPk(id, {
                include: [
                    {
                        model: League,
                        as: 'league',
                        attributes: ['id', 'league_name', 'league_full_name'],
                    },
                    {
                        model: Team,
                        as: 'team',
                        attributes: ['id', 'team_name', 'team_owner', 'team_owner_phone'],
                    },
                ],
            })

            if (!player) {
                return next(new AppError('No player found with that ID', 404))
            }

            return res.status(200).json({
                status: 'success',
                data: {
                    player,
                },
            })
        } catch (error) {
            next(error)
        }
    },

    // Update a player
    update: async (req, res, next) => {
        try {
            const { id } = req.params
            const dataFrombody = req.body
            let playerData = {}

            const player = await PlayerDetail.findByPk(id)

            if (!player) {
                return next(new AppError('No player found with that ID', 404))
            }

            const isApproved = dataFrombody.isApproved
            playerData.is_admin_approved = isApproved


            // Update player
            await player.update(playerData)

            return res.status(200).json({
                status: 'success',
                data: {
                    player,
                },
            })
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return next(new AppError('Player with this name, place, WhatsApp number, and league already exists', 400))
            }
            next(error)
        }
    },

    // Delete a player
    delete: async (req, res, next) => {
        try {
            const { id } = req.params

            const player = await PlayerDetail.findByPk(id)

            if (!player) {
                return next(new AppError('No player found with that ID', 404))
            }

            // Delete player (using paranoid deletion)
            await player.destroy()

            return res.status(204).json({
                status: 'success',
                data: null,
            })
        } catch (error) {
            next(error)
        }
    },

    // Mark player as sold
    markAsSold: async (req, res, next) => {
        try {
            const { id } = req.params
            const { team_id, sold_amount } = req.body

            if (!team_id) {
                return next(new AppError('Team ID is required', 400))
            }

            if (!sold_amount) {
                return next(new AppError('Sold amount is required', 400))
            }

            const player = await PlayerDetail.findByPk(id)

            if (!player) {
                return next(new AppError('No player found with that ID', 404))
            }

            const team = await Team.findByPk(team_id)

            if (!team) {
                return next(new AppError('No team found with that ID', 404))
            }

            // Check if team has enough balance
            const maxAmount = parseInt(team.max_amount_for_bid, 10) || 0
            const currentAmount = parseInt(sold_amount, 10) || 0

            // Get total amount spent by the team
            const players = await PlayerDetail.findAll({
                where: { sold_to: team_id },
                attributes: ['sold_amount'],
            })

            let totalSpent = 0
            players.forEach((p) => {
                if (p.sold_amount) {
                    totalSpent += parseInt(p.sold_amount, 10) || 0
                }
            })

            const remainingBalance = maxAmount - totalSpent

            if (currentAmount > remainingBalance) {
                return next(new AppError(`Team does not have enough balance. Remaining balance: ${remainingBalance}`, 400))
            }

            // Update player as sold
            await player.update({
                sold_to: team_id,
                sold_amount: sold_amount.toString(),
                is_unsold: 'no',
            })

            // Update team's balance
            const newBalance = (remainingBalance - currentAmount).toString()
            await team.update({ balance_amount: newBalance })

            return res.status(200).json({
                status: 'success',
                data: {
                    player,
                    team: {
                        id: team.id,
                        team_name: team.team_name,
                        balance_amount: newBalance,
                    },
                },
            })
        } catch (error) {
            next(error)
        }
    },

    // Mark player as unsold
    markAsUnsold: async (req, res, next) => {
        try {
            const { id } = req.params

            const player = await PlayerDetail.findByPk(id)

            if (!player) {
                return next(new AppError('No player found with that ID', 404))
            }

            // If player was sold to a team, update the team's balance
            if (player.sold_to) {
                const team = await Team.findByPk(player.sold_to)
                if (team) {
                    const soldAmount = parseInt(player.sold_amount, 10) || 0
                    const currentBalance = parseInt(team.balance_amount, 10) || 0
                    const newBalance = (currentBalance + soldAmount).toString()

                    await team.update({ balance_amount: newBalance })
                }
            }

            // Update player as unsold
            await player.update({
                sold_to: null,
                sold_amount: null,
                is_unsold: 'yes',
            })

            return res.status(200).json({
                status: 'success',
                data: {
                    player,
                },
            })
        } catch (error) {
            next(error)
        }
    },

    // Upload player photo
    uploadPhoto: async (req, res, next) => {
        try {
            const { id } = req.params

            if (!req.file) {
                return next(new AppError('No file uploaded', 400))
            }

            const player = await PlayerDetail.findByPk(id)

            if (!player) {
                return next(new AppError('No player found with that ID', 404))
            }

            // Update player photo URL
            const photoUrl = `/uploads/players/${req.file.filename}`
            await player.update({
                player_photo: photoUrl,
                is_updated_dp: '1',
            })

            return res.status(200).json({
                status: 'success',
                data: {
                    player,
                },
            })
        } catch (error) {
            next(error)
        }
    },
    sendVerificationCodeForPlayerRegistration: catchAsync(async (req, res, next) => {
        const { email } = req.body

        if (!email) {
            return next(new AppError('Please provide email', 400))
        }

        let player = await PlayerDetail.findOne({
            where: {
                email,
            },
        })
        console.log('player', player)

        // Generate new verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000)
        const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000)

        if (!player) {
            await PlayerDetail.create({
                email,
                otp: verificationCode,
                verification_code_expires_at: verificationExpiry,
            })
        } else {
            await PlayerDetail.update(
                {
                    otp: verificationCode,
                    verification_code_expires_at: verificationExpiry,
                },
                { where: { player_id: player.player_id } },
            )
        }

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
    }),
    verifyPlayerRegistrationCode: catchAsync(async (req, res, next) => {
        const { otp: code, email } = req.body

        // Find player with matching code
        const player = await PlayerDetail.findOne({
            where: {
                email,
                otp: code,
                verification_code_expires_at: {
                    [Op.gt]: new Date(),
                },
            },
        })

        if (!player) {
            return next(new AppError('Invalid code or code expired', 400))
        }

        // Update player with verified status
        await player.update(
            {
                verification_code: null,
                verification_code_expires_at: null,
            },
            { where: { player_id: player.player_id } },
        )
        const tokenPayload = {
            id: player.player_id,
            is_verified: true,
        }

        const accessToken = generateAccessToken(tokenPayload)
        return res.status(200).json({
            status: 'success',
            message: 'Player registration email successfully verified.',
            data: {
                player,
                accessToken,
                tokenExpireWithin: process.env.JWT_ACCESS_EXPIRY,
            },
        })
    }),
    registerPlayer: catchAsync(async (req, res, next) => {
        const requestesPlayerId = req.user.id ? req.user.id : req.user.player_id
        const playerData = req.body
        const existingPlayer = await PlayerDetail.findOne({
            where: {
                player_id: requestesPlayerId,
            },
        })
        if (!existingPlayer) {
            return next(new AppError('Players verification not completed', 400))
        }

        if (existingPlayer.is_registered) {
            return next(new AppError('Player already registered', 400))
        }

        const dataToUpdate = {
            player_name: playerData.player_name,
            place: playerData.place,
            whatsapp_no: playerData.whatsapp_no,
            current_team: playerData.current_team,
            player_role: playerData.player_role,
            batting_style: playerData.batting_style,
            bowling_style: playerData.bowling_style,
            league_id: playerData.league_id,
            registration_time: new Date(),
            is_registered: true,
            id_proof_url: playerData.id_proof_url,
            player_photo: playerData.player_photo,
            payment_screenshot: playerData.payment_screenshot,
        }
        const player = await PlayerDetail.update(dataToUpdate, {
            where: { player_id: requestesPlayerId },
            returning: true,
        })
        return res.status(200).json({
            status: 'success',
            message: 'registered successfully.',
            data: {
                player,
            },
        })
    }),
}
