
import { Router } from 'express'
import { authentication } from '../controller/auth.controller.js'
import { playerController } from "../controller/player.controller.js"

const playerRouter = Router()

playerRouter.use(authentication)

playerRouter.route('/')
    .get(playerController.getAll)
    .post(playerController.create)

playerRouter
    .route('/:id')
    .get(playerController.getOne)
    .patch(playerController.update)
// .delete(playerController.remove)


export default playerRouter
