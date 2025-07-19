const express = require('express');
const router = express.Router();

const {
  signupController,
  loginController,
  verifyOtpController,
  refreshTokenController,
  protectedController,
} = require('../controllers/authController');

const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/signup', signupController);
router.post('/login', loginController);
router.post('/verify-otp', verifyOtpController);
router.post('/refresh-token', refreshTokenController);

router.get('/protected', authMiddleware, protectedController);

module.exports = router;
