const Joi = require('joi');

exports.validate = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: 'Validation error', details: error.details });
    req.body = value;
    next();
};

exports.schemas = {
    register: Joi.object({
        id: Joi.string().min(3).required(),
        name: Joi.string().min(2).max(120).required(),
        email: Joi.string().email().required(),
        address: Joi.string().allow('', null),
        phone: Joi.string().pattern(/^[\d+\-\s()]{6,20}$/).allow('', null),
        password: Joi.string().min(6).required(),
    }),
    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    }),
};
