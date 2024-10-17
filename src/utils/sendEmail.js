import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});

const sendOtp = async (from, to, subject, text) => {

    const mailOptions = {
        from: from,
        to: to,
        subject: subject,
        text: text,
    };

    try {
        await transporter.sendMail(mailOptions);
        return true
    } catch (error) {
        return false
    }
};

export { sendOtp }