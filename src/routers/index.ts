import { Router } from "express";
import listRouter from './list.router'
import itemRouter from './item.router'
import userRouter from "./user.router";
import imageRouter from "./image.router";


const router = Router()

router.use('/list', listRouter)
router.use('/item', itemRouter)
router.use('/image', imageRouter)
router.use('/user', userRouter)

export default router