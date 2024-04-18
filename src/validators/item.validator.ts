import Joi from "joi";

const itemValidator = Joi.object({
    title: Joi.string()
        .required()
        .min(3)
        .max(30),
    list_id: Joi.number().required(),
    is_active: Joi.boolean(),
    is_delete: Joi.boolean(),
})

export default itemValidator