import { Router } from 'express'
import { authentication, playerAuthentication } from '../controller/auth.controller.js'
import { playerController } from '../controller/player.controller.js'

const playerRouter = Router()

playerRouter.route('/send-otp').post(playerController.sendVerificationCodeForPlayerRegistration)

playerRouter.route('/verify-otp').post(playerController.verifyPlayerRegistrationCode)

playerRouter.use(playerAuthentication) //use this for player registration
playerRouter.route('/register').post(playerController.registerPlayer)

playerRouter.use(authentication)

playerRouter.route('/').get(playerController.getAll).post(playerController.create)

playerRouter.route('/:id').get(playerController.getOne).patch(playerController.update)
// .delete(playerController.remove)

export default playerRouter
