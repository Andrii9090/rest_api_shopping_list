import express from "express"
import router from "./routers";
import cors from "cors"

const app = express()
app.use(cors())

app.use(express.json({
    limit: '50mb'
}))
app.use('/api', router)

export default app