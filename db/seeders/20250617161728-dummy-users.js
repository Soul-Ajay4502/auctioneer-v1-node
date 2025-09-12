'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const { passwordUtils } = await import('../../src/utils/password.util.js')

        const hashedPassword = await passwordUtils.hashPassword('Password@123')

        await queryInterface.bulkInsert(
            'users',
            [
                {
                    user_type: 1,
                    display_name: 'Admin',
                    email: 'admin@gmail.com',
                    password: hashedPassword,
                    is_verified: true,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    user_type: 2,
                    display_name: 'User',
                    email: 'user@gmail.com',
                    password: hashedPassword,
                    is_verified: true,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ],
            {},
        )
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('users', null, {})
    },
}
