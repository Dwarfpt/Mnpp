const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendVerificationEmail = async (email, code) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Подтверждение регистрации',
            html: `
                <h1>Подтверждение регистрации</h1>
                <p>Ваш код подтверждения: <strong>${code}</strong></p>
                <p>Код действителен в течение 1 часа.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully to:', email);
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
    }
};

module.exports = { sendVerificationEmail };