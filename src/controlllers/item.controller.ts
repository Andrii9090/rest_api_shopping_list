import fs from "fs"
import { Request, Response } from "express"
import path from "path"
import logger from "../logger"
import sharp from "sharp"
import Controller from "./controller.abstract"
import validator from '../validators/item.validator'
import Item from "../database/models/item.model"
import { userHasPermission } from "../helpers/permission.helper"
import { AuthRequest } from "../helpers/authenticate.helper"
import config from "../config"
import imageToBase64 from "image-to-base64"
import { Op } from "sequelize"


class ItemController extends Controller {
    async create(req: Request, res: Response) {
        if (this.isValid(req.body)) {
            this.db.create({ ...req.body, creator_id: (req as AuthRequest).userId })
                .then((data) => {
                    const dataTosend = {
                        ...data.dataValues,
                        image: data.dataValues.image ? this.getImageUrl(data.dataValues.id) : null,
                    }
                    this.sendResponse(res, { isError: false, data: dataTosend })
                })
                .catch((e) => this.sendResponse(res, { isError: true }, e))
        } else {
            this.sendResponse(res, { isError: true })
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        const item = await Item.findByPk(req.params.id)

        if (item && (await userHasPermission((req as AuthRequest).userId, item.list_id))) {
            try {
                if (req.params.id && this.isValid(req.body)) {
                    this.db
                        .update({ ...req.body }, { where: { id: Number(req.params.id) } })
                        .then(async () => {
                            const data = await this.db.findByPk(Number(req.params.id), { attributes: ['id', 'title', 'createdAt', 'updatedAt', 'image', 'list_id', 'is_active'] })
                            if (data) {
                                const dataTosend = {
                                    ...data.dataValues,
                                    image: data.dataValues.image ? this.getImageUrl(data.dataValues.id) : null,
                                }
                                this.sendResponse(res, {
                                    isError: false, data: dataTosend
                                })
                            } else {
                                this.sendResponse(res, { isError: true, msg: 'The data isn\'t valid!' })
                            }
                        })
                        .catch((e) => {

                            this.sendResponse(res, { isError: true, msg: 'The data isn\'t valid!' }, e)
                        })
                } else {
                    this.sendResponse(res, { isError: true, msg: 'The data isn\'t valid!' })
                }
            } catch (e) {
                this.sendResponse(res, { isError: true, msg: 'The data isn\'t valid!' })
            }
        }
    }
    async delete(req: Request, res: Response): Promise<void> {
        const item = await Item.findByPk(req.params.id)
        if (item && (await userHasPermission((req as AuthRequest).userId, item?.list_id))) {
            item.is_delete = true
            item.save()
            this.sendResponse(res, { isError: false, data: item.dataValues })
        } else {
            this.sendResponse(res, { isError: true })
        }
    }

    async getAll(req: Request, res: Response): Promise<void> {
        if (await userHasPermission((req as AuthRequest).userId, Number(req.params.list_id))) {
            const filters = this.getFilters(req.query)

            this.db.findAll({
                where: { ...filters.where, list_id: Number(req.params.list_id) },
                attributes: ['id', 'title', 'image', 'createdAt', 'updatedAt', 'is_active', 'list_id', 'is_delete'],
                limit: filters.limit,
                offset: filters.offset,
                order: [['is_active', 'DESC'], ['updatedAt', 'DESC']]
            })
                .then((data) => {
            // console.log(data)

                    const dataTosend = data.map((item) => {
                        return {
                            ...item.dataValues,
                            image: item.dataValues.image ? this.getImageUrl(item.dataValues.id) : null,
                        }
                    })
                    this.sendResponse(res, { isError: false, data: dataTosend })
                })
                .catch((e) => this.sendResponse(res, { isError: true }, e))
        } else {
            this.sendResponse(res, { isError: true, msg: 'You don\'t have permission' })
        }
    }


    async saveImage(req: Request, res: Response) {
        const item = await Item.findByPk(req.params.id, { attributes: ['id', 'image', 'list_id'] })
        if (item && (await userHasPermission((req as AuthRequest).userId, item.list_id)) && req.file) {
            item.image = `${item.list_id}-${item.id}.jpeg`
            await item.save()
            this.resize(req.file.originalname, item.image, res)
                .then(() => this.sendResponse(res, { isError: false, data: this.getImageUrl(item.dataValues.id) }))
                .catch((e) => res.send(null))
        } else {
            this.sendResponse(res, { isError: true })
        }
    }

    async getImage(req: Request, res: Response) {
        try {
            const item = await Item.findByPk(req.params.id, { attributes: ['id', 'image', 'list_id'] })
            if (item) {
                const hasPermiission = await userHasPermission((req as AuthRequest).userId, item?.list_id)
                if (hasPermiission) {
                    if (item.image) {
                        if (req.query.full) {
                            this.sendImage(`${item.list_id}-${item.id}.jpeg`, res)
                        } else {
                            this.sendThumbnail(`${item.list_id}-${item.id}.jpeg`, res)
                        }
                    }
                } else {
                    this.sendResponse(res, { isError: true })
                }
            } else {
                this.sendResponse(res, { isError: true })
            }
        } catch (e) {
            logger.error(e)
            this.sendResponse(res, { isError: true })
        }
    }
    private async resize(originalName: string, imageName: string, res: Response) {
        sharp(path.join(config.imagePath, originalName))
            .resize({ width: 128, withoutEnlargement: true })
            .toFormat('jpeg')
            .jpeg({ quality: 80, force: true })
            .toFile(path.join(config.imagePath, 'thumbnail', imageName))


        sharp(path.join(config.imagePath, originalName))
            .resize({ width: 1280, withoutEnlargement: true })
            .toFormat('jpeg')
            .jpeg({ quality: 80, force: true })
            .toFile(path.join(config.imagePath, imageName))
            .then(() => {
                fs.unlink(path.join(config.imagePath, originalName), () => { })
            })

    }


    async deleteImage(req: Request, res: Response) {
        const item = await Item.findByPk(req.params.id, { attributes: ['id', 'title', 'createdAt', 'updatedAt', 'image', 'list_id', 'is_active'] })
        if (item && (await userHasPermission((req as AuthRequest).userId, item.list_id))) {
            if (!item.image) return this.sendResponse(res, { isError: true })
            const imageName = item.image
            item.image = null
            item.save()
            fs.unlink(path.join(config.imagePath, imageName), () => { })
            fs.unlink(path.join(config.imagePath, 'thumbnail', imageName), () => { })
            this.sendResponse(res, { isError: false, data: item.dataValues })
        } else {
            this.sendResponse(res, { isError: true })
        }
    }

    private async sendThumbnail(imageName: string, res: Response) {
        try {
            const dataIMg = await imageToBase64(path.join(config.imagePath, 'images','thumbnail', `${imageName}`))
            res.send('data:image/jpeg;base64,' + dataIMg)
        } catch (error) {
            console.log(error)
            logger.error(error)
            res.send(null)
        }
    }

    private async sendImage(imageName: string, res: Response) {
        try {
            const dataIMg = await imageToBase64(path.join(config.imagePath, `${imageName}`))
            res.send('data:image/jpeg;base64,' + dataIMg)
        } catch (error) {
            logger.error(error)
            res.send(null)
        }
    }

    private getImageUrl(id: number) {
        const url = `${config.baseUrl}/image/${id}`
        return url
    }
}

export default new ItemController(Item, validator)