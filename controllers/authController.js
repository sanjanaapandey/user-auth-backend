const jwt = require('jsonwebtoken');
const { generateOTP } = require('../utils/otp');
const memoryStore = require('../memoryStore');

const SECRET = 'your-secret-key';
const REFRESH_SECRET = 'your-refresh-secret-key';

// In-memory user list
let users = [];

// ------------------ SIGNUP ------------------
exports.signupController = (req, res) => {
  const { name, email, mobile, password } = req.body;

  if (!name || !email || !mobile || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const userExists = users.find(
    (user) => user.email === email || user.mobile === mobile
  );

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const newUser = { name, email, mobile, password, verified: false };
  users.push(newUser);

  const otp = generateOTP();
  const key = email || mobile;
  memoryStore[key] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

  console.log(`[Signup] OTP for ${key}:`, otp);

  res.status(200).json({ message: 'OTP sent successfully!', otp });
};

// ------------------ OTP VERIFY ------------------
exports.verifyOtpController = (req, res) => {
  const { email, mobile, otp } = req.body;
  const key = email || mobile;

  const record = memoryStore[key];

  if (!record) {
    return res.status(400).json({ message: 'No OTP found. Try again.' });
  }

  if (Date.now() > record.expiresAt) {
    delete memoryStore[key];
    return res.status(400).json({ message: 'OTP expired' });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  const user = users.find((u) => u.email === email || u.mobile === mobile);
  if (user) user.verified = true;

  delete memoryStore[key];

  res.status(200).json({ message: 'OTP verified successfully!' });
};

// ------------------ LOGIN (FIXED) ------------------
exports.loginController = (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const mobile = req.body.mobile?.trim();
  const password = req.body.password;

  const user = users.find(
    (u) =>
      ((email && u.email.toLowerCase() === email) ||
        (mobile && u.mobile === mobile)) &&
      u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (!user.verified) {
    return res.status(403).json({ message: 'Please verify OTP first' });
  }

  const token = jwt.sign({ email: user.email }, SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ email: user.email }, REFRESH_SECRET, {
    expiresIn: '7d',
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: false, // true in production with HTTPS
  });

  res.status(200).json({
    message: 'Login successful',
    refreshToken,
  });
};

// ------------------ REFRESH TOKEN ------------------
exports.refreshTokenController = (req, res) => {
  const { refreshToken } = req.body;

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const token = jwt.sign({ email: decoded.email }, SECRET, {
      expiresIn: '15m',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
    });

    res.status(200).json({ message: 'Token refreshed successfully' });
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

// ------------------ PROTECTED ------------------
exports.protectedController = (req, res) => {
  res.status(200).json({ message: `Welcome, ${req.user.email}! 🔒` });
};
