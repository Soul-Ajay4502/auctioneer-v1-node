'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('player_details', [
      {
        player_name: 'Player 1',
        place: 'Place 1',
        whatsapp_no: '1234567890',
        current_team: 'Team 1',
        player_role: 'Batsman',
        batting_style: 'Right Handed',
        bowling_style: 'Right Arm Medium',
        sold_to: 1,
        sold_amount: 1000,
        league_id: 1,
        is_unsold: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        player_name: 'Player 2',
        place: 'Place 2',
        whatsapp_no: '1234567890',
        current_team: 'Team 2',
        player_role: 'Bowler',
        batting_style: 'Left Handed',
        bowling_style: 'Left Arm Medium',
        sold_to: 2,
        sold_amount: 1000,
        league_id: 1,
        is_unsold: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        player_name: 'Player 3',
        place: 'Place 3',
        whatsapp_no: '1234567890',
        current_team: 'Team 3',
        player_role: 'Allrounder',
        batting_style: 'Right Handed',
        bowling_style: 'Right Arm Medium',
        sold_to: 3,
        sold_amount: 1000,
        league_id: 1,
        is_unsold: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        player_name: 'Player 4',
        place: 'Place 4',
        whatsapp_no: '1234567890',
        current_team: 'Team 4',
        player_role: 'Wicketkeeper',
        batting_style: 'Left Handed',
        bowling_style: 'Left Arm Medium',
        sold_to: 4,
        sold_amount: 1000,
        league_id: 1,
        is_unsold: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        player_name: 'Player 5',
        place: 'Place 5',
        whatsapp_no: '1234567890',
        current_team: 'Team 5',
        player_role: 'Batsman',
        batting_style: 'Right Handed',
        bowling_style: 'Right Arm Medium',
        sold_to: 5,
        sold_amount: 1000,
        league_id: 1,
        is_unsold: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        player_name: 'Player 6',
        place: 'Place 6',
        whatsapp_no: '1234567890',
        current_team: 'Team 6',
        player_role: 'Bowler',
        batting_style: 'Left Handed',
        bowling_style: 'Left Arm Medium',
        sold_to: 6,
        sold_amount: 1000,
        league_id: 1,
        is_unsold: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        player_name: 'Player 7',
        place: 'Place 7',
        whatsapp_no: '1234567890',
        current_team: 'Team 7',
        player_role: 'Allrounder',
        batting_style: 'Right Handed',
        bowling_style: 'Right Arm Medium',
        sold_to: 7,
        sold_amount: 1000,
        league_id: 1,
        is_unsold: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        player_name: 'Player 8',
        place: 'Place 8',
        whatsapp_no: '1234567890',
        current_team: 'Team 8',
        player_role: 'Wicketkeeper',
        batting_style: 'Left Handed',
        bowling_style: 'Left Arm Medium',
        sold_to: 8,
        sold_amount: 1000,
        league_id: 1,
        is_unsold: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        player_name: 'Player 9',
        place: 'Place 9',
        whatsapp_no: '1234567890',
        current_team: 'Team 9',
        player_role: 'Batsman',
        batting_style: 'Right Handed',
        bowling_style: 'Right Arm Medium',
        sold_to: 9,
        sold_amount: 1000,
        league_id: 1,
        is_unsold: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        player_name: 'Player 10',
        place: 'Place 10',
        whatsapp_no: '1234567890',
        current_team: 'Team 10',
        player_role: 'Bowler',
        batting_style: 'Left Handed',
        bowling_style: 'Left Arm Medium',
        sold_to: 10,
        sold_amount: 1000,
        league_id: 1,
        is_unsold: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('player_details', null, {});
  }
};
