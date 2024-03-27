import Joi from "joi";

const listValidator = Joi.object({
    title: Joi.string()
        .required()
        .min(3)
        .max(50),
    is_active: Joi.boolean(),
    is_delete: Joi.boolean(),
})


export default listValidator