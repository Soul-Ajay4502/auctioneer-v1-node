'use strict'
import { League, Team, PlayerDetail, User } from '../../db/models/index.js'
import { AppError } from '../utils/app-error.js'

export const leagueController = {
    // Create a new league
    create: async (req, res, next) => {
        try {
            const leagueData = req.body

            // Set created_by to the logged-in user's ID
            leagueData.created_by = req.user.id

            const league = await League.create(leagueData)

            return res.status(201).json({
                status: 'success',
                data: {
                    league
                }
            })
        } catch (error) {
            next(error)
        }
    },

    // Get all leagues
    getAll: async (req, res, next) => {
        try {
            const leagues = await League.findAll({
                include: [
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'first_name', 'last_name', 'email']
                    }
                ]
            })

            return res.status(200).json({
                status: 'success',
                results: leagues.length,
                data: {
                    leagues
                }
            })
        } catch (error) {
            next(error)
        }
    },

    // Get a specific league by ID
    getOne: async (req, res, next) => {
        try {
            const { id } = req.params

            const league = await League.findByPk(id, {
                include: [
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'first_name', 'last_name', 'email']
                    },
                    {
                        model: Team,
                        as: 'teams'
                    },
                    {
                        model: PlayerDetail,
                        as: 'players'
                    }
                ]
            })

            if (!league) {
                return next(new AppError('No league found with that ID', 404))
            }

            return res.status(200).json({
                status: 'success',
                data: {
                    league
                }
            })
        } catch (error) {
            next(error)
        }
    },

    // Update a league
    update: async (req, res, next) => {
        try {
            const { id } = req.params
            const leagueData = req.body

            const league = await League.findByPk(id)

            if (!league) {
                return next(new AppError('No league found with that ID', 404))
            }

            // Update league
            await league.update(leagueData)

            return res.status(200).json({
                status: 'success',
                data: {
                    league
                }
            })
        } catch (error) {
            next(error)
        }
    },

    // Delete a league
    delete: async (req, res, next) => {
        try {
            const { id } = req.params

            const league = await League.findByPk(id)

            if (!league) {
                return next(new AppError('No league found with that ID', 404))
            }

            // Delete league (using paranoid deletion)
            await league.destroy()

            return res.status(204).json({
                status: 'success',
                data: null
            })
        } catch (error) {
            next(error)
        }
    },

    // Get league statistics
    getStats: async (req, res, next) => {
        try {
            const { id } = req.params

            const league = await League.findByPk(id)

            if (!league) {
                return next(new AppError('No league found with that ID', 404))
            }

            // Get count of teams
            const teamsCount = await Team.count({
                where: { league_id: id }
            })

            // Get count of players
            const playersCount = await PlayerDetail.count({
                where: { league_id: id }
            })

            // Get count of sold players
            const soldPlayersCount = await PlayerDetail.count({
                where: {
                    league_id: id,
                    sold_to: {
                        [Op.ne]: null
                    }
                }
            })

            // Get count of unsold players
            const unsoldPlayersCount = await PlayerDetail.count({
                where: {
                    league_id: id,
                    is_unsold: 'yes'
                }
            })

            return res.status(200).json({
                status: 'success',
                data: {
                    teamsCount,
                    playersCount,
                    soldPlayersCount,
                    unsoldPlayersCount
                }
            })
        } catch (error) {
            next(error)
        }
    }
}