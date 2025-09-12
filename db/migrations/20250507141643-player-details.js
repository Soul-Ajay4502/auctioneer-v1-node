'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'player_details',
            {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER,
                    field: 'player_id',
                },
                registration_time: {
                    type: Sequelize.STRING(100),
                    allowNull: true,
                },
                player_name: {
                    type: Sequelize.STRING(255),
                    allowNull: true,
                },
                place: {
                    type: Sequelize.STRING(255),
                    allowNull: true,
                },
                whatsapp_no: {
                    type: Sequelize.STRING(15),
                    allowNull: true,
                },
                current_team: {
                    type: Sequelize.STRING(255),
                    allowNull: true,
                },
                player_role: {
                    type: Sequelize.STRING(100),
                    allowNull: true,
                },
                batting_style: {
                    type: Sequelize.STRING(100),
                    allowNull: true,
                },
                bowling_style: {
                    type: Sequelize.STRING(100),
                    allowNull: true,
                },
                player_photo: {
                    type: Sequelize.STRING(500),
                    allowNull: true,
                },
                payment_screenshot: {
                    type: Sequelize.STRING(500),
                    allowNull: true,
                },
                id_proof_url: {
                    type: Sequelize.STRING(500),
                    allowNull: true,
                },
                sold_to: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    references: {
                        model: 'teams',
                        key: 'team_id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'SET NULL',
                },
                sold_amount: {
                    type: Sequelize.DECIMAL(10, 2),
                    allowNull: true,
                },
                league_id: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    references: {
                        model: 'leagues',
                        key: 'league_id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                is_updated_dp: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                is_unsold: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                created_at: {
                    allowNull: false,
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                },
                updated_at: {
                    allowNull: true,
                    type: Sequelize.DATE,
                },
                deleted_at: {
                    type: Sequelize.DATE,
                    allowNull: true,
                },
                otp: {
                    type: Sequelize.STRING(6),
                    allowNull: true,
                },
                verification_code_expires_at: {
                    type: Sequelize.DATE,
                    allowNull: true,
                },
                is_registered: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: false,
                },
                email: {
                    allowNull: false,
                    type: Sequelize.STRING,
                    allowNull: true,
                },
                is_admin_approved: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: false,
                },
            },
            {
                underscored: true,
                paranoid: true,
            },
        )

        await queryInterface.addIndex('player_details', ['player_name', 'place', 'whatsapp_no', 'league_id'], {
            unique: true,
            name: 'unique_player',
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('player_details', 'unique_player')
        await queryInterface.dropTable('player_details')
    },
}
