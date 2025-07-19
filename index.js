const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

// Routes
app.use('/api', authRoutes);

// Root
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// DB optional
mongoose.connect(process.env.MONGO_URI || '', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected successfully!');
}).catch(() => {
  console.log('No MongoDB, using memory only.');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
