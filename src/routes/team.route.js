import { Router } from 'express'
import { authentication } from '../controller/auth.controller.js'
import { teamController } from '../controller/team.controller.js'

const teamRouter = Router()

teamRouter.use(authentication)

teamRouter.route('/').get(teamController.getAll).post(teamController.create)

teamRouter.route('/:id').get(teamController.getOne).patch(teamController.update).delete(teamController.remove)

teamRouter.route('stats/:id').get(teamController.getStats)

export default teamRouter
