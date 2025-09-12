'use strict'
import { DataTypes } from 'sequelize'
import sequelize from '../../config/db.config.js'

const League = sequelize.define(
    'leagues',
    {
        league_id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        league_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'League name cannot be null',
                },
                notEmpty: {
                    msg: 'League name cannot be empty',
                },
            },
        },
        league_full_name: {
            type: DataTypes.STRING(250),
            allowNull: true,
        },
        league_locations: {
            type: DataTypes.STRING(300),
            allowNull: true,
        },
        total_players: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        total_teams: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Total teams cannot be null',
                },
                notEmpty: {
                    msg: 'Total teams cannot be empty',
                },
            },
        },
        has_unsold: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        league_start_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        league_end_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        registration_fee: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        registration_end_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        player_base_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 100,
        },
        bid_amount_per_team: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 5000,
        },
        auction_start_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        break_points: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        increments: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        minimum_player_count: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        deleted_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        join_link: {
            type: DataTypes.UUID,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
            unique: true,
        },
    },
    {
        underscored: true,
        timestamps: true,
        paranoid: true,
        freezeTableName: true,
    },
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
