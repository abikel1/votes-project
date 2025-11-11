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
    firstName: stripComma(Joi.string().trim().min(2).max(120).required()),
    lastName:  stripComma(Joi.string().trim().min(2).max(120).required()),
    email:     stripComma(Joi.string().trim().email().required()),
    city:      stripComma(Joi.string().trim().allow('', null)),
    zip:       stripComma(Joi.string().trim().allow('', null)),
    address:   stripComma(Joi.string().trim().allow('', null)),
    phone:     stripComma(Joi.string().trim().pattern(/^[\d+\-\s()]{6,20}$/).allow('', null)),
    password:  Joi.string().min(6).required(), // ← כמו ברישום
  }),

  login: Joi.object({
    email: Joi.string().trim().email().required(),
    password: Joi.string().required(),
  }),

  // שכחתי סיסמה – אימייל תקין כמו בלוגין/רישום
  forgotPassword: Joi.object({
    email: stripComma(Joi.string().trim().email().required()),
  }),

  // איפוס בפועל – אותה בדיקת סיסמה כמו ברישום (min 6)
  resetPassword: Joi.object({
    token: Joi.string().trim().required(),
    password: Joi.string().min(6).required(),
  }),
};
