"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,
    );

    await queryInterface.createTable(
      "leagues",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
          field: "league_id",
        },
        league_name: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        league_full_name: {
          type: Sequelize.STRING(250),
          allowNull: true,
        },
        league_locations: {
          type: Sequelize.STRING(300),
          allowNull: true,
        },
        total_players: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        total_teams: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        has_unsold: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        league_start_date: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        league_end_date: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        registration_fee: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true,
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "users",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        registration_end_date: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        player_base_price: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true,
          defaultValue: 100,
        },
        bid_amount_per_team: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true,
          defaultValue: 5000,
        },
        auction_start_date: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        break_points: {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue:
            "0,100,500,1000,1500,2000,2500,3000,3500,4000,4500,5000",
        },
        increments: {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: "100,200,300,400,500,600,700,800,900,1000,1000",
        },
        minimum_player_count: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updated_at: {
          allowNull: true,
          type: Sequelize.DATE,
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        join_link: {
          type: Sequelize.UUID,
          allowNull: false,
          defaultValue: Sequelize.literal("uuid_generate_v4()"),
          unique: true,
        },
      },
      {
        underscored: true,
        paranoid: true,
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("leagues");
  },
};
