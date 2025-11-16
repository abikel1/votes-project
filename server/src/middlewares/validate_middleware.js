// validate_middleware.js
const Joi = require('joi');

const stripComma = (j) =>
  j.custom((v) => (typeof v === 'string' ? v.replace(/[,\s]+$/, '') : v));

// ✅ פונקציית עזר – ממירה Joi errors ל-{ field: message }
function joiToFieldErrors(error) {
  const fieldErrors = {};
  error.details.forEach((d) => {
    const key = d.path[0] || 'form';
    if (!fieldErrors[key]) {
      fieldErrors[key] = d.message.replace(/\"/g, '');
    }
  });
  return fieldErrors;
}

// ✅ מידלוור כללי – תמיד מחזיר { errors: {field: msg} }
exports.validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = joiToFieldErrors(error);
    return res.status(400).json({ errors });
  }

  req.body = value;
  next();
};

/* =========================
   סכמות משותפות למשתמש
   ========================= */

const userFields = {
  firstName: stripComma(
    Joi.string().trim().min(2).max(120).messages({
      'string.empty': 'שם פרטי חייב לפחות 2 תווים',
      'string.min': 'שם פרטי חייב לפחות 2 תווים',
      'any.required': 'שם פרטי הוא שדה חובה',
    })
  ),
  lastName: stripComma(
    Joi.string().trim().min(2).max(120).messages({
      'string.empty': 'שם משפחה חייב לפחות 2 תווים',
      'string.min': 'שם משפחה חייב לפחות 2 תווים',
      'any.required': 'שם משפחה הוא שדה חובה',
    })
  ),
  email: stripComma(
    Joi.string().trim().email().messages({
      'string.email': 'אימייל לא תקין',
      'string.empty': 'אימייל הוא שדה חובה',
      'any.required': 'אימייל הוא שדה חובה',
    })
  ),
  city: stripComma(Joi.string().trim().allow('', null)),
  zip: stripComma(Joi.string().trim().allow('', null)),
  address: stripComma(Joi.string().trim().allow('', null)),
  phone: stripComma(
    Joi.string()
      .trim()
      .pattern(/^[\d+\-\s()]{6,20}$/)
      .allow('', null)
      .messages({
        'string.pattern.base': 'טלפון לא תקין',
      })
  ),
};

exports.schemas = {
  // 🔹 הרשמה – אותם חוקים, בלי כפילות
  register: Joi.object({
    ...userFields,
    password: Joi.string().min(6).required().messages({
      'string.min': 'סיסמה חייבת לפחות 6 תווים',
      'any.required': 'סיסמה היא שדה חובה',
      'string.empty': 'סיסמה היא שדה חובה',
    }),
  }).fork(['firstName', 'lastName', 'email'], (s) => s.required()),

  // 🔹 עדכון פרופיל – משתמש באותם שדות, בלי סיסמה
  updateProfile: Joi.object(userFields).fork(
    ['firstName', 'lastName', 'email'],
    (s) => s.required()
  ),

  login: Joi.object({
    email: stripComma(
      Joi.string().trim().email().required().messages({
        'string.email': 'אימייל לא תקין',
        'string.empty': 'אימייל הוא שדה חובה',
        'any.required': 'אימייל הוא שדה חובה',
      })
    ),
    password: Joi.string().required().messages({
      'any.required': 'סיסמה היא שדה חובה',
      'string.empty': 'סיסמה היא שדה חובה',
    }),
  }),

  // שכחתי סיסמה – כמו שהיה, רק נשאר באותו סטייל
  forgotPassword: Joi.object({
    email: stripComma(
      Joi.string().trim().email().required().messages({
        'string.email': 'אימייל לא תקין',
        'string.empty': 'אימייל הוא שדה חובה',
        'any.required': 'אימייל הוא שדה חובה',
      })
    ),
  }),

  resetPassword: Joi.object({
    token: Joi.string().trim().required(),
    password: Joi.string().min(6).required().messages({
      'string.min': 'סיסמה חייבת לפחות 6 תווים',
      'any.required': 'סיסמה היא שדה חובה',
      'string.empty': 'סיסמה היא שדה חובה',
    }),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': 'סיסמה נוכחית היא שדה חובה',
      'string.empty': 'סיסמה נוכחית היא שדה חובה',
    }),
    newPassword: Joi.string().min(6).required().messages({
      'string.min': 'סיסמה חייבת לפחות 6 תווים',
      'any.required': 'סיסמה חדשה היא שדה חובה',
      'string.empty': 'סיסמה חדשה היא שדה חובה',
    }),
  }),
};
