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
        const { email, password, repeatPassword } = req.body
        const isValid = userValidator.validate({ email, password })
        if (!isValid.error && password === repeatPassword) {
            const user = await this.model.findOne({ where: { email } })
            if (user) {
                this.sendResponse(res, { isError: true, msg: 'User already exists' })
                return
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
        const mysecretkey = process.env['TOKEN_SECRET'] ? process.env['TOKEN_SECRET'] : 'fdsghjkgfdsafgjynhbgcvx';

        const payload = {
            id: id,
        };

        return jsonwebtoken.sign(payload, mysecretkey, {
            expiresIn: "360d",
        })
    }

    logout(req: Request, res: Response) {
        this.sendResponse(res, { isError: false, msg: 'User logged out' })
    }

    async generateAccessCode(req: Request, res: Response) {
        const useCode = await UserAccessCode.findOne({ where: { user_id: (req as AuthRequest).userId } })

        if (useCode && Number(useCode.expire_date) > new Date().getTime()) {
            UserAccessCode.update({ expire_date: new Date().getTime() + 10 * 60 * 1000, user_id: (req as AuthRequest).userId }, { where: { user_id: (req as AuthRequest).userId } })
                .then(() => {
                    this.sendResponse(res, { isError: false, msg: 'Access code generated', data: { code: useCode.code } })
                })
                .catch((e) => {
                    this.sendResponse(res, { isError: true, msg: 'Access code not generated' }, e)
                })

        } else {
            const code = await this.generateCode()
            UserAccessCode.create({ code, expire_date: new Date().getTime() + 10 * 60 * 1000, user_id: (req as AuthRequest).userId })
                .then(() => {
                    this.sendResponse(res, { isError: false, msg: 'Access code generated', data: { code } })
                })
                .catch((e) => {
                    this.sendResponse(res, { isError: true, msg: 'Access code not generated' }, e)
                })
        }
    }

    private async generateCode() {
        const code = Math.floor(Math.random() * 90000) + 10000
        const codeSaved = await UserAccessCode.findOne({ where: { code } })
        if (codeSaved) {
            this.generateCode()
        } else {
            return code
        }
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

    async update(req: Request, res: Response) {
        const { email, password } = req.body
        const user = await this.model.findByPk((req as AuthRequest).userId)
        if (user) {
            if (await bcrypt.compare(password, user.password)) {
                user
                    .update({ email: email })
                    .then(() => {
                        this.sendResponse(res, { isError: false, msg: 'User updated' })
                    })
                    .catch((e) => {
                        this.sendResponse(res, { isError: true, msg: 'User not updated' }, e)
                    })
            } else {
                this.sendResponse(res, { isError: true, msg: 'User not updated!' })
            }
        }
    }

    private sendResponse(res: Response, data: TypeResponse, msg?: string) {
        if (data.isError) {
            res.status(400).send(data)
            if (msg) {
                logger.error(msg.toString())
            }
        } else {
            res.send(data)
        }
    }
}


export default new UserController()