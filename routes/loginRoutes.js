const express = require('express');
const router = express.Router();
const { register, login, logout, resetPassword, forgetPassword } = require('../controller/loginController');
const upload = require('../middleware/uploadMiddleware');
const Login = require('../model/login');

router.post('/register', register);

router.post('/login', login);

router.post('/logout', logout);

router.post('/forgetPassword', forgetPassword);

router.put('/reset-password/:token', resetPassword);

router.post('/upload', upload.single('file'), (req, res) => {
    res.status(200).json({
        message: 'File uploaded successfully!',
        file: req.file
    });
});

router.post('/upload-multiple', upload.array('files', 5), (req, res) => {
    res.status(200).json({
        message: 'Files uploaded successfully!',
        files: req.files
    });
});

router.post('/create', upload.array('images'), async (req, res) => {
    try {
        const imagePaths = req.files.map(file => file.path);
        console.log()
        const product = await Login.create({
            username: req.body.username,
            password: req.body.password,
            images: imagePaths
        });

        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;