'use strict'
import { DataTypes } from 'sequelize'
import sequelize from '../../config/db.config.js'

const League = sequelize.define(
    'leagues',
    {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
            field: 'league_id'
        },
        league_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'League name cannot be null'
                },
                notEmpty: {
                    msg: 'League name cannot be empty'
                }
            }
        },
        league_full_name: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        league_locations: {
            type: DataTypes.STRING(300),
            allowNull: true
        },
        total_players: {
            type: DataTypes.STRING(45),
            allowNull: true
        },
        total_teams: {
            type: DataTypes.STRING(45),
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Total teams cannot be null'
                },
                notEmpty: {
                    msg: 'Total teams cannot be empty'
                }
            }
        },
        has_unsold: {
            type: DataTypes.STRING(45),
            allowNull: false,
            defaultValue: 'no'
        },
        league_start_date: {
            type: DataTypes.STRING(45),
            allowNull: true
        },
        league_end_date: {
            type: DataTypes.STRING(45),
            allowNull: true
        },
        registration_fee: {
            type: DataTypes.STRING(45),
            allowNull: true
        },
        created_by: {
            type: DataTypes.STRING(45),
            allowNull: true
        },
        registration_end_date: {
            type: DataTypes.STRING(45),
            allowNull: true
        },
        player_base_price: {
            type: DataTypes.STRING(45),
            allowNull: true,
            defaultValue: '100'
        },
        bid_amount_per_team: {
            type: DataTypes.STRING(45),
            allowNull: true,
            defaultValue: '5000'
        },
        auction_start_date: {
            type: DataTypes.STRING(45),
            allowNull: true
        },
        break_points: {
            type: DataTypes.STRING(45),
            allowNull: true
        },
        increments: {
            type: DataTypes.STRING(45),
            allowNull: true
        },
        minimum_player_count: {
            type: DataTypes.STRING(45),
            allowNull: true
        },
        created_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'created_date'
        }
    },
    {
        underscored: true,
        timestamps: true,
        paranoid: true,
        freezeTableName: true,
        createdAt: 'created_date',
        updatedAt: 'updated_at'
    }
)

// Define associations after all models are imported
const setupAssociations = async () => {
    try {
        const User = (await import('./user.js')).default
        const Team = (await import('./team.js')).default
        const PlayerDetail = (await import('./player-details.js')).default

        // League belongs to a user who created it
        League.belongsTo(User, { foreignKey: 'created_by', as: 'creator' })

        // League has many teams
        League.hasMany(Team, { foreignKey: 'league_id', as: 'teams' })

        // League has many players
        League.hasMany(PlayerDetail, { foreignKey: 'league_id', as: 'players' })
    } catch (error) {
        console.error('Error setting up League associations:', error)
    }
}

// Setup associations asynchronously to avoid circular dependencies
setupAssociations()

export default League