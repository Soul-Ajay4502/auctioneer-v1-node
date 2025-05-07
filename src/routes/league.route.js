import { Router } from 'express'
import { authentication } from '../controller/auth.controller.js'
import { leagueController } from '../controller/league.controller.js'
import { restrictToRoles } from '../middleware/rbac.middleware.js'
import { ROLES } from '../constants/roles.js'

const leagueRouter = Router()

leagueRouter.use(authentication)

leagueRouter.route('/')
    .get(restrictToRoles([ROLES.SUPER_ADMIN]), leagueController.getAll)
    .post(restrictToRoles([ROLES.SUPER_ADMIN]), leagueController.create)

leagueRouter
    .route('/:id')
    .get(leagueController.getOne)

export default leagueRouter
