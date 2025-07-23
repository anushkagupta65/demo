const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: 'Your App <no-reply@yourapp.com>',
            to: options.to,
            subject: options.subject,
            text: options.text,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent: ${info.response}`);

    } catch (error) {
        console.error(`❌ Email sending failed: ${error.message}`);
        throw new Error('Email could not be sent');
    }
};

module.exports = sendEmail;