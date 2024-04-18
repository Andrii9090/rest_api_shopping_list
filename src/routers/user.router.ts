import { Router } from "express";
import UserController from "../controlllers/user.controller";
import isAutentificate from "../helpers/authenticate.helper";

const router = Router()

const controller = UserController

router.post('/login', controller.login.bind(controller))
router.use(isAutentificate).get('/access-code', controller.generateAccessCode.bind(controller))
router.post('/', controller.createUser.bind(controller))
router.use(isAutentificate).get('/', controller.getUserData.bind(controller))
router.use(isAutentificate).put('/', controller.update.bind(controller))

export default router