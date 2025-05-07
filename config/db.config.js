import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'
import path from 'path'

const __dirname = path.dirname(new URL(import.meta.url).pathname)
if (process.env.NODE_ENV === 'production') {
    dotenv.config({ path: path.join(__dirname, '../.env') })
} else {
    dotenv.config()
}

// const env = process.env.NODE_ENV || 'development'

const dbName = process.env.DB_NAME
const host = process.env.DB_HOST
const username = process.env.DB_USERNAME
const password = process.env.DB_PASSWORD
const port = process.env.DB_PORT

const sequelize = new Sequelize(dbName, username, password, {
    host: host,
    port: port,
    dialect: 'postgres',
    logging: false,
    seederStorage: 'sequelize',
})

export default sequelize
