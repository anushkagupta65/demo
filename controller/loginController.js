const Login = require('../model/login');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1d',
    });
};

exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        const userExists = await Login.findOne({ username });
        if (userExists) return res.status(400).json({ error: 'username already used' });

        const login = await Login.create({ username, password });

        res.status(201).json({
            token: generateToken(login._id),
            login: { id: login._id, username: login.username }
        });
    } catch (err) {
        res.status(500).json({
            error: err.message
        })
    }
}

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const login = await Login.findOne({ username });

        if (!login || !(await login.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: login._id, role: login.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.json({
            "message": "Login Successful",
            login: { id: login._id, username: login.username }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
    });

    res.status(200).json({
        message: 'Logged out successfully',
    });
};

exports.resetPassword = async (req, res) => {
    console.log('1');
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');
    console.log('resetpasswordtoken', resetPasswordToken)
    const login = await Login.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });
    console.log(login)

    if (!login) return res.status(400).json({ error: 'Token is invalid or expired' });

    login.password = req.body.password;
    login.resetPasswordToken = undefined;
    login.resetPasswordExpire = undefined;
    await login.save();
    res.status(200).json({ message: 'Password updated successfully' });
};

exports.forgetPassword = async (req, res) => {
    const login = await Login.findOne({ username: req.body.username });
    if (!login) return res.status(404).json({ error: 'User not found' });
    console.log(login);
    const resetToken = login.getResetPasswordToken();
    await login.save({ validateBeforeSave: false });

    const resetUrl = `http://localhost:3000/password/reset/${resetToken}`;
    const message = `You requested a password reset. Click here: \n\n ${resetUrl}`;

    try {
        await sendEmail({
            to: 'peperastogi@gmail.com',
            subject: 'Password Reset Request',
            text: message
        });

        res.status(200).json({ message: 'Reset link sent to email' });
    } catch (err) {
        login.resetPasswordToken = undefined;
        login.resetPasswordExpire = undefined;
        await login.save({ validateBeforeSave: false });

        res.status(500).json({ error: 'Email could not be sent' });
    }
};