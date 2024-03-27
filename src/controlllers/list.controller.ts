import Controller from "./controller.abstract"
import listValidator from "../validators/list.validator"
import List from "../database/models/list.model"
import { Request, Response } from "express"
import ListUser from "../database/models/listUser.model"
import { userHasPermission } from "../helpers/permission.helper"
import logger from "../logger"
import User from "../database/models/user.model"
import { AuthRequest } from "../helpers/authenticate.helper"
import UserAccessCode from "../database/models/userAccessCode.model"

class ListController extends Controller {

    async create(req: Request, res: Response<any, Record<string, any>>): Promise<void> {
        try {
            if (this.isValid(req.body)) {
                this.db.create({ ...req.body, creator_id: (req as AuthRequest).userId })
                    .then((data) => {
                        ListUser.create({ user_id: (req as AuthRequest).userId, list_id: data.id })
                        this.sendResponse(res, { isError: false, data })
                    })
                    .catch((e) => this.sendResponse(res, { isError: true }, e))
            } else {
                this.sendResponse(res, { isError: true })
            }
        } catch (e) {
            this.sendResponse(res, { isError: true })
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        if (await userHasPermission(Number((req as AuthRequest).userId), Number(req.params.id))) {
            super.update(req, res)
        }
    }

    async delete(req: Request, res: Response): Promise<void> {
        const list = await List.findByPk(req.params.id)
        if (list && await userHasPermission(Number((req as AuthRequest).userId), Number(req.params.id))) {
            list.is_delete = true
            list.save()
            this.sendResponse(res, { isError: false })
        } else {
            this.sendResponse(res, { isError: true })
        }
    }

    async getAll(req: Request, res: Response): Promise<void> {
        const filters = this.getFilters(req.query)
        this.db.findAll({
            where: {
                ...filters.where, is_delete: false
            },
            include: [
                {
                    model: User,
                    as: 'users',
                    where: {
                        id: (req as AuthRequest).userId
                    },
                    attributes: ['id']
                }
            ],
            limit: filters.limit,
            offset: filters.offset,
        })
            .then((data) => {
                this.sendResponse(res, { isError: false, data })
            })
            .catch((e) => {
                this.sendResponse(res, { isError: true }, e)
            })
    }

    async addUserToList(req: Request, res: Response): Promise<void> {
        if (req.body.code) {
            UserAccessCode.findOne({ where: { code: Number(req.body.code) } })
            .then((code)=>{
                if (code &&Number(code.expire_date) >= new Date().getTime()) {
                    List.findByPk(req.params.id)
                    .then((list)=>{
                        if (list) {
                            ListUser.create({ user_id: code.user_id, list_id: req.params.id })
                            .then((data)=>{
                                code.destroy()
                                this.sendResponse(res, { isError: false, msg: 'User added to list' })
                            })
                            .catch((e)=>{
                                this.sendResponse(res, { isError: true, msg: 'User already in list' }, e)
                            })
                        }
                    })
                } else {
                    this.sendResponse(res, { isError: true, msg: 'Access code expired' })
                }
            })
        } else {
            this.sendResponse(res, { isError: true, msg: 'Code is not valid' })
        }
    }
}

export default new ListController(List, listValidator)