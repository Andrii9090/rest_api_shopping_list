import { Router } from "express";
import UserController from "../controlllers/user.controller";
import isAutentificate from "../helpers/authenticate.helper";

const router = Router()

const controller = UserController

router.post('/login', controller.login.bind(controller))
router.get('/access-code', isAutentificate, controller.generateAccessCode.bind(controller))
router.get('/reset-password', isAutentificate, controller.resetPassword.bind(controller))
router.post('/', controller.createUser.bind(controller))
router.put('/', isAutentificate,controller.update.bind(controller))
router.get('/', isAutentificate, controller.getUserData.bind(controller))

export default router