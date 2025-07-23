const express = require('express');
const app = express();
const connectDB = require('./config/db');
const loginRoutes = require('./routes/loginRoutes');
const { protect, authorizeRoles } = require('./middleware/authMiddleware');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const port = process.env.PORT || 5000;

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use('/', loginRoutes);

app.get('/profile', protect, (req, res) => {
    res.json({ message: 'Welcome', login: req.login });
});

app.get('/admin', protect, authorizeRoles('admin'), (req, res) => {
    res.send('Welcome, Admin!');
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});