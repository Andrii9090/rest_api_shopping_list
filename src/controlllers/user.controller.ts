import { Request, Response } from "express";
import User from "../database/models/user.model"

import bcrypt from 'bcrypt'
import { config } from "dotenv";
import userValidator from "../validators/user.validator.";
import jsonwebtoken from 'jsonwebtoken'
import { AuthRequest } from "../helpers/authenticate.helper";
import logger from "../logger";
import { TypeResponse } from "./controller.abstract";
import UserAccessCode from "../database/models/userAccessCode.model";

config()

class UserController {
    private model = User

    async createUser(req: Request, res: Response) {
        const { email, password } = req.body
        const isValid = userValidator.validate({ email, password })
        if (!isValid.error) {
            const user = await this.model.findOne({ where: { email } })
            if (user) {
                this.sendResponse(res, { isError: true, msg: 'User already exists' })
            }
            const hash = await bcrypt.hash(password, 10)
            this.model
                .create({ email, password: hash })
                .then((data) => {
                    this.sendResponse(res, { isError: false, data: { token: this.generateToken(data.id) } })
                })
                .catch((e) => {
                    this.sendResponse(res, { isError: true, msg: 'User not created' }, e)
                })
        } else {
            this.sendResponse(res, { isError: true, msg: 'User not created' })
        }
    }

    async login(req: Request, res: Response) {
        const { email, password } = req.body
        const user = await this.model.findOne({ where: { email } })
        if (user) {
            const match = await bcrypt.compare(password, user.password)
            if (match) {
                const token = this.generateToken(user.id)
                this.sendResponse(res, { isError: false, data: { token } })
            } else {
                this.sendResponse(res, { isError: true, msg: 'Wrong password' })
            }
        } else {
            this.sendResponse(res, { isError: true, msg: 'User not found' })
        }
    }
    private generateToken(id: number) {
        const mysecretkey = process.env.TOKEN_SECRET ? process.env.TOKEN_SECRET : '';

        const payload = {
            id: id,
        };

        return jsonwebtoken.sign(payload, mysecretkey, {
            expiresIn: "120d",
        })
    }

    logout(req: Request, res: Response) {
        this.sendResponse(res, { isError: false, msg: 'User logged out' })
    }

    async generateAccessCode(req: Request, res: Response) {
        const userCode = await UserAccessCode.findOne({ where: { user_id: (req as AuthRequest).userId } })
        if (userCode && Number(userCode.expire_date) > new Date().getTime()) {
            this.sendResponse(res, { isError: false, msg: 'Access code already generated', data: { code: userCode.code } })
            return 
        }
        let code = Math.floor(Math.random() * 90000) + 10000
        UserAccessCode.create({ code, expire_date: new Date().getTime() + 10 * 60 * 1000, user_id: (req as AuthRequest).userId })
        .then(() => {
            this.sendResponse(res, { isError: false, msg: 'Access code generated', data: { code } })
        })
        .catch((e) => {
            this.sendResponse(res, { isError: true, msg: 'Access code not generated' }, e)
        })
    }

    async getUserData(req: Request, res: Response) {
        const user = await this.model.findByPk((req as AuthRequest).userId)
        if (user) {
            this.sendResponse(res, {
                isError: false, data: {
                    email: user.email
                }
            })
        }
    }

    private async sendResponse(res: Response, data: TypeResponse, msg?: string) {
        if (data.isError) {
            res.status(400)
            if (msg) {
                logger.error(msg.toString())
            }
        }
        res.setHeader('Content-Type', 'application/json')
        res.json(data)
    }
}


export default new UserController()