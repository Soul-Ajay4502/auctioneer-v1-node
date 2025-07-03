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
    // Get all leagues with pagination
    getAll: async (req, res, next) => {
        try {
            // Extract pagination parameters from query
            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 10;
            const offset = (page - 1) * limit;

            // Get total count and paginated data
            const { count, rows: leagues } = await League.findAndCountAll({
                include: [
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'display_name', 'email']
                    }
                ],
                where: {
                    created_by: req.user.id
                },
                limit,
                offset,
                order: [['createdAt', 'DESC']]
            });

            // Calculate pagination metadata
            const totalPages = Math.ceil(count / limit);
            const hasNext = page < totalPages;
            const hasPrevious = page > 1;
            const leaguesWithJoinLink = leagues.map(league => {
                let leagueObj = league.toJSON();
                const leagueName = leagueObj.league_name.replace(/\s+/g, '').toLowerCase();
                leagueObj.join_link = `${process.env.CLIENT_URL}app/join-league/${leagueName}-${leagueObj.join_link}`;
                return leagueObj;
            });

            return res.status(200).json({
                status: 'success',
                results: leagues.length,
                pagination: {
                    total: count,
                    totalPages,
                    currentPage: page,
                    limit,
                    hasNext,
                    hasPrevious
                },
                data: leaguesWithJoinLink

            });
        } catch (error) {
            next(error);
        }
    },

    // Get a specific league by ID
    getOne: async (req, res, next) => {
        try {
            const { id } = req.params

            let league = await League.findByPk(id, {
                include: [
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'display_name', 'email']
                    }
                ]
            });

            const teamCount = await league.countTeams();     // Assumes `League.hasMany(Team, { as: 'teams' })`
            const playerCount = await league.countPlayers(); // Assumes `League.hasMany(PlayerDetail, { as: 'players' })`

            if (!league) {
                return next(new AppError('No league found with that ID', 404))
            }
            league = league.toJSON();
            league.registered_teams_count = teamCount;
            league.registered_players_count = playerCount;
            league.join_link = `${process.env.CLIENT_URL}/join-league/${league.league_name.replace(/\s+/g, '').toLowerCase()}-${league.join_link}`;

            return res.status(200).json({
                status: 'success',
                data: league

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

            if (league.created_by !== req.user.id) {
                return next(new AppError('You are not allowed to update this league', 403))
            }

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
            if (league.created_by !== req.user.id) {
                return next(new AppError('You are not allowed to delete this league', 403))
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