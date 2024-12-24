const { google } = require('googleapis');
const nodemailer = require('nodemailer');
require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const sendMailVerifyAccount = async (email) => {
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
        const info = await transport.sendMail({
            from: `"L2 Team Book" <${process.env.USER_EMAIL}>`, // địa chỉ gửi
            to: email, // địa chỉ nhận
            subject: 'Cảm ơn bạn đã tin tưởng và mua hàng!', // tiêu đề email
            text: 'Cảm ơn bạn đã lựa chọn L2 Team Books!', // nội dung văn bản thuần
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px; background-color: #f9f9f9;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #e67e22;">L2 Team Books</h2>
                        <p style="color: #555; font-size: 14px;">Cảm ơn bạn đã tin tưởng chúng tôi!</p>
                    </div>
                    <p>Xin chào <strong>${email}</strong>,</p>
                    <p>L2 Team Books chân thành cảm ơn bạn đã lựa chọn và tin tưởng sử dụng sản phẩm của chúng tôi.</p>
                    <p>Chúng tôi rất vinh dự được phục vụ bạn. Sự tin tưởng và ủng hộ của bạn là nguồn cảm hứng để chúng tôi không ngừng cải thiện và mang đến những trải nghiệm tốt nhất cho khách hàng.</p>
                    <p>Nếu bạn có bất kỳ câu hỏi nào về đơn hàng hoặc cần hỗ trợ thêm, vui lòng liên hệ với chúng tôi qua email <a href="mailto:${process.env.USER_EMAIL}" style="color: #3498db; text-decoration: none;">${process.env.USER_EMAIL}</a>. Chúng tôi luôn sẵn sàng hỗ trợ bạn.</p>
                    <p>Một lần nữa, chúng tôi chân thành cảm ơn bạn đã đồng hành cùng L2 Team Books. Hy vọng sẽ được phục vụ bạn trong tương lai.</p>
                    <p style="margin-top: 20px; font-size: 14px; text-align: center; color: #777;">Trân trọng,</p>
                    <p style="text-align: center; color: #e67e22; font-size: 18px;">Đội ngũ L2 Team Books</p>
                </div>
            `,
        });
    } catch (error) {
        console.log('Error sending email:', error);
    }
};

module.exports = sendMailVerifyAccount;
