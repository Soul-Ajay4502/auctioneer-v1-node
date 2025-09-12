'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const now = new Date()

        await queryInterface.bulkInsert(
            'user_roles',
            [
                {
                    label: 'admin',
                    access_level: 1, // Highest access level
                    created_at: now,
                    updated_at: now,
                },
                {
                    label: 'user',
                    access_level: 2, // Regular member access level
                    created_at: now,
                    updated_at: now,
                },
            ],
            {},
        )
    },

    async down(queryInterface, Sequelize) {
        // Remove the seeded roles
        await queryInterface.bulkDelete(
            'user_roles',
            {
                label: {
                    [Sequelize.Op.in]: ['admin', 'user'],
                },
            },
            {},
        )
    },
}
