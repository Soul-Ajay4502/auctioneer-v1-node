import { Router } from 'express'
import authRouter from './auth.route.js'
import userRouter from './user.route.js'
import leagueRouter from './league.route.js'
import teamRouter from './team.route.js'

const router = Router()

const API_VERSION = 'v1'
const API_BASE = `/api/${API_VERSION}`

const routes = [
    { path: '/auth', router: authRouter },
    { path: '/user', router: userRouter },
    { path: '/leagues', router: leagueRouter },
    { path: '/teams', router: teamRouter },
    // Add new routes here as they are created
]

// Mount all routes
routes.forEach((route) => {
    router.use(`${API_BASE}${route.path}`, route.router)
})

export default router
