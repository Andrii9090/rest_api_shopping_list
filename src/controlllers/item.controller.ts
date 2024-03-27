import Controller from "./controller.abstract"
import { Request, Response } from "express"
import validator from '../validators/item.validator'
import Item from "../database/models/item.model"
import { userHasPermission } from "../helpers/permission.helper"
import { AuthRequest } from "../helpers/authenticate.helper"
import path from "path"

class ItemController extends Controller {

    /**
     * 
     * @example
     *   {
            name:string       
            image:string      
            creator_id:number
            list_id:number
            is_active:bool
            is_delete:bool
     *   }
     */
    async create(req: Request, res: Response) {
        if (this.isValid(req.body)) {
            this.db.create({ ...req.body, creator_id: (req as AuthRequest).userId })
                .then((data) => this.sendResponse(res, { isError: false, data }))
                .catch((e) => this.sendResponse(res, { isError: true }, e))
        } else {
            this.sendResponse(res, { isError: true })
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        const item = await Item.findByPk(req.params.id)
        if (item && (await userHasPermission((req as AuthRequest).userId, item.list_id))) {
            super.update(req, res)
        }
    }
    async delete(req: Request, res: Response): Promise<void> {
        const item = await Item.findByPk(req.params.id)
        if (item && (await userHasPermission((req as AuthRequest).userId, item?.list_id))) {
            item.is_delete = true
            item.save()
            this.sendResponse(res, { isError: false })
        } else {
            this.sendResponse(res, { isError: true })
        }
    }

    async getAll(req: Request, res: Response): Promise<void> {
        if (await userHasPermission((req as AuthRequest).userId, Number(req.params.list_id))) {
            const filters = this.getFilters(req.query)
            this.db.findAll({
                where: { ...filters.where, list_id: Number(req.params.list_id), is_delete: false },
                limit: filters.limit,
                offset: filters.offset
            })
                .then((data) => {
                    this.sendResponse(res, { isError: false, data })
                })
                .catch((e) => this.sendResponse(res, { isError: true }, e))
        } else {
            this.sendResponse(res, { isError: true, msg: 'You don\'t have permission' })
        }
    }

    async saveImage(req: Request, res: Response) {
        const item = await Item.findByPk(req.params.id)
        if (item && (await userHasPermission((req as AuthRequest).userId, item.list_id))) {
            item.image = req.file?.filename || null
            await item.save()
            this.sendResponse(res, { isError: false, data: req.file?.filename })
        } else {
            this.sendResponse(res, { isError: true })
        }
    }

    async getImage(req: Request, res: Response) {
        const item = await Item.findByPk(req.params.id)
        console.log('ITEM', item);
        
        if(item && (await userHasPermission((req as AuthRequest).userId, item.list_id))) {
            res.sendFile(path.resolve(process.cwd(), 'public', 'uploads', item.image || ''))
        }else{
            console.log('You don\'t have permission');
            
            this.sendResponse(res, { isError: true })
        }
    }
}

export default new ItemController(Item, validator)