'use strict'
import { DataTypes } from 'sequelize'
import sequelize from '../../config/db.config.js'

const PlayerDetail = sequelize.define(
    'player_details',
    {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
            field: 'player_id'
        },
        registration_time: {
            type: DataTypes.DATE,
            allowNull: true
        },
        player_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Player name cannot be null'
                },
                notEmpty: {
                    msg: 'Player name cannot be empty'
                }
            }
        },
        place: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        whatsapp_no: {
            type: DataTypes.STRING(15),
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'WhatsApp number cannot be null'
                },
                notEmpty: {
                    msg: 'WhatsApp number cannot be empty'
                }
            }
        },
        current_team: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        player_role: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        batting_style: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        bowling_style: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        player_photo: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        payment_screenshot: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        id_proof_url: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        sold_to: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        sold_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        league_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        is_updated_dp: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        is_unsold: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    },
    {
        underscored: true,
        timestamps: true,
        paranoid: true,
        freezeTableName: true,
        indexes: [
            {
                unique: true,
                fields: ['player_name', 'place', 'whatsapp_no', 'league_id'],
                name: 'unique_player'
            }
        ]
    }
)

// Define associations after all models are imported
const setupAssociations = async () => {
    try {
        const League = (await import('./leagues.js')).default
        const Team = (await import('./team.js')).default

        // Player belongs to a League
        PlayerDetail.belongsTo(League, { foreignKey: 'league_id', as: 'league' })

        // Player can belong to a Team (if sold)
        PlayerDetail.belongsTo(Team, { foreignKey: 'sold_to', as: 'team' })
    } catch (error) {
        console.error('Error setting up PlayerDetail associations:', error)
    }
}

// Setup associations asynchronously to avoid circular dependencies
setupAssociations()

export default PlayerDetail