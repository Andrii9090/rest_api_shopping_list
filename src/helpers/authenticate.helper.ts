import { NextFunction, Response, Request } from "express"
import logger from "../logger"
import User from "../database/models/user.model"

import jsonwebtoken from 'jsonwebtoken'


export interface AuthRequest extends Request {
    userId?: number
}

interface UserDecodedType {
    id: number
}

const getDecodedUserData = (token: string): UserDecodedType => {
    const mysecretkey = process.env.TOKEN_SECRET ? process.env.TOKEN_SECRET : '';
    const decoded = jsonwebtoken.verify(token, mysecretkey) as UserDecodedType
    return decoded
}
const isAutentificate = (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
        const token = req.headers.authorization.replace('Bearer ', '')
        try {
            (req as AuthRequest).userId = getDecodedUserData(token).id
            next()
        } catch (error) {
            (req as AuthRequest).userId = undefined
            res.status(401)
            res.send({ isError: true, msg: 'Not autorized!' })
        }
    }else {
        res.status(401)
        res.send({ isError: true, msg: 'Not autorized!' })
    }
}



export default isAutentificate