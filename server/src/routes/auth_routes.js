const router = require('express').Router();
const { forgotPassword, resetPassword } = require('../controllers/auth_controller');
const { validate, schemas } = require('../middlewares/validate_middleware');

router.post('/password/forgot', validate(schemas.forgotPassword), forgotPassword);
router.post('/password/reset', validate(schemas.resetPassword), resetPassword);

module.exports = router;
