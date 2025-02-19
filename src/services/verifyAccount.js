const { google } = require('googleapis');
const nodemailer = require('nodemailer');
require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const sendMailVerifyAccount = async (email, otp) => {
    try {
        const accessToken = await oAuth2Client.getAccessToken();
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.USER_EMAIL,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken,
            },
        });

        await transport.sendMail({
            from: `"L2 Book Book" <${process.env.USER_EMAIL}>`, // địa chỉ gửi
            to: email, // địa chỉ nhận
            subject: 'Xác minh tài khoản của bạn', // tiêu đề email
            text: `Mã xác minh của bạn là: ${otp}`, // nội dung văn bản thuần
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px; background-color: #f9f9f9;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #e67e22;">Xác minh tài khoản</h2>
                        <p style="color: #555; font-size: 14px;">Hoàn tất đăng ký tài khoản L2 Book Books!</p>
                    </div>
                    <p>Xin chào <strong>${email}</strong>,</p>
                    <p>Bạn đã đăng ký tài khoản tại <strong>L2 Book Books</strong>. Vui lòng sử dụng mã OTP dưới đây để xác minh tài khoản của bạn:</p>
                    <div style="text-align: center; margin: 20px 0; font-size: 20px; font-weight: bold; color: #e67e22;">
                        ${otp}
                    </div>
                    <p>Mã OTP có hiệu lực trong vòng 5 phút. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
                    <p>Nếu có bất kỳ thắc mắc nào, hãy liên hệ với chúng tôi qua email <a href="mailto:${process.env.USER_EMAIL}" style="color: #3498db; text-decoration: none;">${process.env.USER_EMAIL}</a>.</p>
                    <p style="margin-top: 20px; font-size: 14px; text-align: center; color: #777;">Trân trọng,</p>
                    <p style="text-align: center; color: #e67e22; font-size: 18px;">Đội ngũ L2 Book Books</p>
                </div>
            `,
        });

        console.log(`Email xác minh đã được gửi đến ${email}`);
    } catch (error) {
        console.log('Error sending email:', error);
    }
};

module.exports = sendMailVerifyAccount;
