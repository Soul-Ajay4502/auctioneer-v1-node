import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import * as http from 'http'
import { catchAsync } from './utils/catch-async.js'
import { AppError } from './utils/app-error.js'
import { globalErrorHandler } from './controller/error-handler.controller.js'
import path from 'path'
import routes from './routes/index.js'
import { apiLogger } from './middleware/api.middleware.js'

const __dirname = path.dirname(new URL(import.meta.url).pathname)
if (process.env.NODE_ENV === 'production') {
    dotenv.config({ path: path.join(__dirname, '../.env') })
} else {
    dotenv.config()
}
const app = express()
const server = http.createServer(app)
console.log(process.env.NODE_ENV)
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST'],
        credentials: true,
    })
)
app.use(bodyParser.json())
app.use(cookieParser())

app.use(apiLogger) // to be updated

app.use(routes)

// app.use(
//     '*',
//     catchAsync(async (req, res, next) => {
//         throw new AppError(`Can't find ${req.originalUrl} on this server`, 404)
//     })
// )
app.all('/{*any}', catchAsync(async (req, res, next) => {
    throw new AppError(`Can't find ${req.originalUrl} on this server`, 404)
}))
app.use(globalErrorHandler)

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})

