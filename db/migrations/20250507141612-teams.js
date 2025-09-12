"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "teams",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
          field: "team_id",
        },
        team_name: {
          type: Sequelize.STRING(300),
          allowNull: false,
        },
        team_owner: {
          type: Sequelize.STRING(200),
          allowNull: true,
        },
        team_owner_phone: {
          type: Sequelize.STRING(20),
          allowNull: true,
        },
        league_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "leagues",
            key: "league_id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        jersey_color: {
          type: Sequelize.STRING(45),
          allowNull: true,
        },
        team_logo: {
          type: Sequelize.STRING(450),
          allowNull: true,
        },
        logo_url: {
          type: Sequelize.STRING(450),
          allowNull: true,
        },
        max_amount_for_bid: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true,
        },
        balance_amount: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true,
        },
        max_amount_per_player: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true,
        },
        is_auction_started: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
          field: "created_date",
        },
        updated_at: {
          allowNull: true,
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
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("teams");
  },
};
