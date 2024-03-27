import { Response, Request } from "express";
import { ObjectSchema } from "joi";
import logger from "../logger";
import { ParsedQs } from "qs";
import { separateQueryParam } from "../helpers/itemsLimitParse.helper";
import { ModelCtor } from "sequelize-typescript";
import { Model } from "sequelize/types/model";

export type TypeResponse = {
    isError: boolean,
    data?: Model<any, any> | Model<any, any>[] | null | Array<object> | string | Object,
    msg?: string
}

type ConditionsObjectType = {
    [key: string]: unknown
}

abstract class Controller {

    constructor(protected db: ModelCtor, protected validator: ObjectSchema<unknown>) {
    }

    abstract create(req: Request, res: Response): void

    async update(req: Request, res: Response) {
        try {
            if (req.params.id && this.isValid(req.body)) {
                this.db
                    .update({ ...req.body }, { where: { id: Number(req.params.id) } })
                    .then(async () => {
                        const data = await this.db.findByPk(Number(req.params.id))
                        this.sendResponse(res, {
                            isError: false, data
                        })
                    })
                    .catch((e) => {
                        this.sendResponse(res, { isError: true, msg: 'The data isn\'t valid!' }, e)
                    })
            } else {
                this.sendResponse(res, { isError: true, msg: 'The data isn\'t valid!' })
            }

        } catch (e) {
            logger.error(e)
            this.sendResponse(res, { isError: true, msg: 'The data isn\'t valid!' })
        }
    }

    abstract delete(req: Request, res: Response): Promise<void>


    abstract getAll(req: Request, res: Response): Promise<void>

    /**
     * Function to get conditions for filtering data from database.
     * @param query Query from request.
     * @returns Object with conditions, skip and take for Sequelize.
     */
    protected getFilters(query: ParsedQs): { where: object, offset: number | undefined, limit: number | undefined } {
        const where: ConditionsObjectType = {}
        let pagination = {
            limit: 50,
            offset: 0
        }
        // Iterate over each key in query
        for (const key in query) {
            // If it's 'limit' key then extract skip and take
            if (key === 'limit') {
                pagination = separateQueryParam(query[key] as string)
                continue
            }
            let value: unknown = query[key]?.toString().trim()
            // If value is not empty then add it to where object
            if (value) {
                // If value is 'true' or 'false' change it to boolean
                if (value === 'true') {
                    value = true
                }
                if (value === 'false') {
                    value = false
                }
                where[key as keyof ConditionsObjectType] = value
            }
        }

        return {
            where,
            offset: pagination.offset,
            limit: pagination.limit
        }
    }

    protected isValid(data: object): boolean {
        const validated = this.validator.validate(data)
        if (validated.error) {
            logger.error(validated.error.message)
            return false
        }
        return true
    }

    protected async sendResponse(res: Response, data: TypeResponse, msg?: string) {
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

export default Controller