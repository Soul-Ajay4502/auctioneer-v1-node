import { Router } from 'express'
import { authentication } from '../controller/auth.controller.js'
import { leagueController } from '../controller/league.controller.js'
import { restrictToRoles } from '../middleware/rbac.middleware.js'
import { ROLES } from '../constants/roles.js'

const leagueRouter = Router()

leagueRouter.use(authentication)

leagueRouter.route('/').get(leagueController.getAll).post(leagueController.create)

leagueRouter.route('/:id').get(leagueController.getOne).patch(leagueController.update).delete(leagueController.delete)

leagueRouter.route('stats/:id').get(leagueController.getStats)

export default leagueRouter
