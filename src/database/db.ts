import { Sequelize } from "sequelize-typescript";
import Item from "./models/item.model";
import User from "./models/user.model";
import List from "./models/list.model";
import ListUser from "./models/listUser.model";
import UserAccessCode from "./models/userAccessCode.model";
import config from "../config";

const DB_NAME = config.production ? process.env['DB_NAME'] ? process.env['DB_NAME'] : '' : 'list_app_test'
const DB_USER = process.env['DB_USER'] ? process.env['DB_USER'] : 'admin'
const DB_PASSWORD = process.env['DB_PASSWORD'] ? process.env['DB_PASSWORD'] : ''

let db: Sequelize
 
const initDb = async () => {
    if (config.production) {
        db = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
            dialect: 'postgres',
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            models: [Item, User, List, ListUser, UserAccessCode],
            logging: false
        })
    } else {
        db = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
            dialect: 'postgres',
            host: process.env.DB_HOST_TEST,
            port: Number(process.env.DB_PORT),
            models: [Item, User, List, ListUser, UserAccessCode],
            logging: false
        })
    }
    await db.authenticate()
        .then(async () => {
            await db.sync({ alter: false })
            console.log('Connection has been established successfully.')
        })
        .catch((e) => console.error('Unable to connect to the database:', e))
    return db
}

const clearDb = async () => {
    await User.destroy({ truncate: true, cascade: true, restartIdentity: true }).then((i) => { console.log(i) })
    await List.destroy({ truncate: true, cascade: true, restartIdentity: true })
    await ListUser.destroy({ truncate: true, cascade: true, restartIdentity: true })
    await Item.destroy({ truncate: true, cascade: true, restartIdentity: true })
    await UserAccessCode.destroy({ truncate: true, cascade: true, restartIdentity: true })
    await db.drop()
}



export default initDb

export { clearDb }