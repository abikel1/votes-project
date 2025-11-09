const Joi = require('joi');

const stripComma = (j) =>
    j.custom((v) => (typeof v === 'string' ? v.replace(/[,\s]+$/, '') : v));

exports.validate = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: 'Validation error', details: error.details });
    req.body = value;
    next();
};

exports.schemas = {
    register: Joi.object({
        name: stripComma(Joi.string().trim().min(2).max(120).required()),
        email: stripComma(Joi.string().trim().email().required()),
        city: stripComma(Joi.string().trim().allow('', null)),       // ← הוספתי את העיר
        zip: stripComma(Joi.string().trim().allow('', null)),       // מזהה עיר/אזור
        address: stripComma(Joi.string().trim().allow('', null)),   // כתובת פרטית
        phone: stripComma(Joi.string().trim().pattern(/^[\d+\-\s()]{6,20}$/).allow('', null)),
        password: Joi.string().min(6).required(),
    }),
    login: Joi.object({
        email: Joi.string().trim().email().required(),
        password: Joi.string().required(),
    }),
};
