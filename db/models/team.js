'use strict'
import { DataTypes } from 'sequelize'
import sequelize from '../../config/db.config.js'

const Team = sequelize.define(
    'teams',
    {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
            field: 'team_id'
        },
        team_name: {
            type: DataTypes.STRING(300),
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Team name cannot be null'
                },
                notEmpty: {
                    msg: 'Team name cannot be empty'
                }
            }
        },
        team_owner: {
            type: DataTypes.STRING(200),
            allowNull: true
        },
        team_owner_phone: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        league_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'League ID cannot be null'
                }
            }
        },
        jersey_color: {
            type: DataTypes.STRING(45),
            allowNull: true
        },
        team_logo: {
            type: DataTypes.STRING(450),
            allowNull: true
        },
        logo_url: {
            type: DataTypes.STRING(450),
            allowNull: true
        },
        max_amount_for_bid: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        balance_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        max_amount_per_player: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        is_auction_started: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
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
        const League = (await import('./leagues.js')).default
        const PlayerDetail = (await import('./player-details.js')).default

        // Team belongs to a League
        Team.belongsTo(League, { foreignKey: 'league_id', as: 'league' })

        // Team has many players (who were sold to this team)
        Team.hasMany(PlayerDetail, { foreignKey: 'sold_to', as: 'players' })
    } catch (error) {
        console.error('Error setting up Team associations:', error)
    }
}

// Setup associations asynchronously to avoid circular dependencies
setupAssociations()

export default Team