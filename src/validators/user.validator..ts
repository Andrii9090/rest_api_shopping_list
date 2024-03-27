import Joi from "joi";

const userValidator = Joi.object({
    email: Joi.string()
        .required()
        .email(),
    password: Joi.string().required(),

})

export default userValidator