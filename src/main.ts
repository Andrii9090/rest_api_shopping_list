import app from "./app"
import initDb from "./database/db"
import config from "./config"

const db = initDb()

app.listen(config.port, () => {
    console.log('Server started on port ' + config.port)
})

export {
    db
}