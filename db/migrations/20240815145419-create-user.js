'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'users',
            {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER,
                },
                user_type: {
                    allowNull: true,
                    references: {
                        model: 'user_roles',
                        key: 'id',
                    },
                    onUpdate: 'CASCADE',
                    type: Sequelize.INTEGER,
                },
                first_name: {
                    type: Sequelize.STRING,
                },
                last_name: {
                    type: Sequelize.STRING,
                },
                email: {
                    type: Sequelize.STRING,
                },
                password: {
                    type: Sequelize.STRING,
                },
                img_url: {
                    type: Sequelize.STRING,
                    allowNull: true,
                },
                verification_code: {
                    type: Sequelize.STRING,
                    allowNull: true,
                },
                verification_code_expires_at: {
                    type: Sequelize.DATE,
                    allowNull: true,
                },
                is_verified: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: false,
                },
                refresh_token: {
                    allowNull: true,
                    type: Sequelize.STRING,
                },
                created_at: {
                    allowNull: false,
                    type: Sequelize.DATE,
                },
                updated_at: {
                    allowNull: false,
                    type: Sequelize.DATE,
                },
                deleted_at: {
                    type: Sequelize.DATE,
                    allowNull: true,
                },
            },
            {
                underscored: true,
                paranoid: true,
            },
        )

        await queryInterface.addIndex('users', ['email', 'is_verified', 'deleted_at'], {
            unique: true,
            name: 'users_email_verified_unique',
            where: {
                is_verified: true,
                deleted_at: null,
            },
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('users', 'users_email_verified_unique')
        await queryInterface.dropTable('users')
    },
}
