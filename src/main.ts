import { configDotenv } from "dotenv"
import app from "./app"
import initDb from "./database/db"

configDotenv()

const db = initDb()

app.listen(process.env.PORT, () => {
    console.log('Server started on port ' + process.env.PORT)
})

export {
    db
}