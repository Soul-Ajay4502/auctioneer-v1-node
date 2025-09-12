'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'user_roles',
            {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER,
                },
                label: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                access_level: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
                created_at: {
                    allowNull: false,
                    type: Sequelize.DATE,
                },
                updated_at: {
                    allowNull: false,
                    type: Sequelize.DATE,
                },
            },
            {
                underscored: true,
            },
        )
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('user_roles')
    },
}
