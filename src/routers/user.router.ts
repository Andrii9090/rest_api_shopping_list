import { Router } from "express";
import UserController from "../controlllers/user.controller";
import isAutentificate from "../helpers/authenticate.helper";

const router = Router()

const controller = UserController

router.get('/', controller.getUserData.bind(controller))
router.post('/create', controller.createUser.bind(controller))
router.use(isAutentificate).get('/access-code', controller.generateAccessCode.bind(controller))
router.post('/login', controller.login.bind(controller))
router.use(isAutentificate).get('/logout', controller.logout.bind(controller))

export default router