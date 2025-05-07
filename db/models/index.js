'use strict'
import User from './user.js'
import League from './leagues.js'
import Team from './team.js'
import PlayerDetail from './player-details.js'

// Define associations
const setupAssociations = () => {
  // User associations
  User.hasMany(League, { foreignKey: 'created_by', as: 'leagues' })

}

setupAssociations()

export {
  User,
  League,
  Team,
  PlayerDetail
}