import { Router } from 'express'
import { authentication } from '../controller/auth.controller.js'
import { deleteUser, getAlUsers, getUserById, updateUser, getOwnDetails, userStatistics } from '../controller/user.controller.js'
import { restrictToRoles } from '../middleware/rbac.middleware.js'
import { ROLES } from '../constants/roles.js'

const userRouter = Router()

// Apply authentication to all routes
userRouter.use(authentication)

userRouter.route('/').get(restrictToRoles([ROLES.SUPER_ADMIN]), getAlUsers)

userRouter.route('/me').get(restrictToRoles([ROLES.SUPER_ADMIN]), getOwnDetails)

userRouter.route('/stats/me').get(userStatistics)

userRouter
    .route('/:id')
    .get(restrictToRoles([ROLES.SUPER_ADMIN]), getUserById)
    .patch(restrictToRoles([ROLES.SUPER_ADMIN]), updateUser)
    .delete(restrictToRoles([ROLES.SUPER_ADMIN]), deleteUser)

export default userRouter
