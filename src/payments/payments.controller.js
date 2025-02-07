const modelCart = require('../cart/cart.model');
const modelPayments = require('./payments.model');
const modelProducts = require('../products/products.model');
const modelUser = require('../users/users.model');

const axios = require('axios');
const crypto = require('crypto');
const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require('vnpay');

class controllerPayments {
    async paymentCod(req, res) {
        const { id } = req.decodedToken;
        const { address, phone, typePayments, fullName } = req.body;
        if (!address || !phone || !typePayments) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thống tin' });
        }
        if (!id) {
            return res.status(403).json({ message: 'Vui lòng đăng nhập' });
        }

        const findCart = await modelCart.findOne({ userId: id });
        if (!findCart) {
            return res.status(400).json({ message: 'Giỏ hàng khóa' });
        }
        if (typePayments === 'COD') {
            const newPayment = new modelPayments({
                userId: id,
                products: findCart.products,
                address: req.body.address,
                phone: req.body.phone,
                typePayments: req.body.typePayments,
            });
            await newPayment.save();
            await findCart.deleteOne();
            return res.status(200).json({
                message: 'Thanh toán thành công',
                orderId: newPayment._id,
            });
        }
        if (typePayments === 'MOMO') {
            var partnerCode = 'MOMO';
            var accessKey = 'F8BBA842ECF85';
            var secretkey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
            var requestId = partnerCode + new Date().getTime();
            var orderId = requestId;
            var orderInfo = `thanh toan ${findCart._id}`; // nội dung giao dịch thanh toán
            var redirectUrl = 'http://localhost:5001/api/check-payment-momo'; // 8080
            var ipnUrl = 'http://localhost:5001/api/check-payment-momo';
            // var ipnUrl = redirectUrl = "https://webhook.site/454e7b77-f177-4ece-8236-ddf1c26ba7f8";
            var amount = findCart.total;
            var requestType = 'captureWallet';
            var extraData = ''; //pass empty value if your merchant does not have stores

            var rawSignature =
                'accessKey=' +
                accessKey +
                '&amount=' +
                amount +
                '&extraData=' +
                extraData +
                '&ipnUrl=' +
                ipnUrl +
                '&orderId=' +
                orderId +
                '&orderInfo=' +
                orderInfo +
                '&partnerCode=' +
                partnerCode +
                '&redirectUrl=' +
                redirectUrl +
                '&requestId=' +
                requestId +
                '&requestType=' +
                requestType;
            //puts raw signature

            //signature
            var signature = crypto.createHmac('sha256', secretkey).update(rawSignature).digest('hex');

            //json object send to MoMo endpoint
            const requestBody = JSON.stringify({
                partnerCode: partnerCode,
                accessKey: accessKey,
                requestId: requestId,
                amount: amount,
                orderId: orderId,
                orderInfo: orderInfo,
                redirectUrl: redirectUrl,
                ipnUrl: ipnUrl,
                extraData: extraData,
                requestType: requestType,
                signature: signature,
                lang: 'en',
            });

            const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return res.status(201).json(response.data.payUrl);
        }
        if (typePayments === 'VNPAY') {
            const vnpay = new VNPay({
                tmnCode: 'DH2F13SW',
                secureSecret: 'NXZM3DWFR0LC4R5VBK85OJZS1UE9KI6F',
                vnpayHost: 'https://sandbox.vnpayment.vn',
                testMode: true, // tùy chọn
                hashAlgorithm: 'SHA512', // tùy chọn
                loggerFn: ignoreLogger, // tùy chọn
            });
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const vnpayResponse = await vnpay.buildPaymentUrl({
                vnp_Amount: findCart.total, //
                vnp_IpAddr: '127.0.0.1', //
                vnp_TxnRef: findCart._id,
                vnp_OrderInfo: `${findCart._id}`,
                vnp_OrderType: ProductCode.Other,
                vnp_ReturnUrl: `http://localhost:5001/api/check-payment-vnpay`, //
                vnp_Locale: VnpLocale.VN, // 'vn' hoặc 'en'
                vnp_CreateDate: dateFormat(new Date()), // tùy chọn, mặc định là hiện tại
                vnp_ExpireDate: dateFormat(tomorrow), // tùy chọn
            });
            return res.status(201).json(vnpayResponse);
        }
    }

    async checkPaymentMomo(req, res, next) {
        const { orderInfo, resultCode } = req.query;
        if (resultCode === '0') {
            const result = orderInfo.split(' ')[2];
            const findCart = await modelCart.findOne({ _id: result });
            const newPayment = new modelPayments({
                userId: findCart.userId,
                products: findCart.products,
                address: findCart.address,
                phone: findCart.phone,
                typePayments: 'MOMO',
            });
            await newPayment.save();
            await findCart.deleteOne();
            return res.redirect(`${process.env.DOMAIN_URL}/checkout/${newPayment._id}`);
        }
    }

    async checkPaymentVnpay(req, res) {
        const { vnp_ResponseCode, vnp_OrderInfo } = req.query;
        if (vnp_ResponseCode === '00') {
            const idCart = vnp_OrderInfo;
            const findCart = await modelCart.findOne({ _id: idCart });
            const newPayment = new modelPayments({
                userId: findCart.userId,
                products: findCart.products,
                address: findCart.address,
                phone: findCart.phone,
                typePayments: 'VNPAY',
            });
            await newPayment.save();
            await findCart.deleteOne();
            return res.redirect(`${process.env.DOMAIN_URL}/checkout/${newPayment._id}`);
        }
    }

    async getPayment(req, res) {
        const { id } = req.decodedToken;
        const { idOrder } = req.query;
        try {
            const payment = await modelPayments.findOne({ _id: idOrder, userId: id });
            const findProducts = await modelProducts.find({
                _id: { $in: payment.products.map((item) => item.productId) },
            });
            const data = findProducts.map((item) => ({
                images: item.images,
                name: item.name,
                price: item.price,
                quantityUserBuy: payment.products.find(
                    (product) => product.productId.toString() === item._id.toString(),
                ).quantity,
                id: item._id,
            }));
            return res.status(200).json({ payment, data });
        } catch (error) {
            console.log(error);
        }
    }
    async historyOrder(req, res) {
        const { id } = req.decodedToken; // Lấy userId từ token
        const { params } = req.query;
        const findUser = await modelUser.findOne({ _id: id });

        if (!findUser) return res.status(400).json({ message: 'Người dùng không tồn tại' });

        try {
            if (findUser.isAdmin === false) {
                // Tìm lịch sử đơn hàng của user
                const historyOrder = await modelPayments.find({ userId: id, statusOrder: params });

                // Tìm thông tin sản phẩm chi tiết
                const data = await Promise.all(
                    historyOrder.map(async (order) => {
                        const detailedProducts = await Promise.all(
                            order.products.map(async (product) => {
                                const findProduct = await modelProducts.findById(product.productId);
                                return {
                                    ...findProduct.toObject(), // Chuyển document MongoDB thành object
                                    quantityUserBuy: product.quantity,
                                };
                            }),
                        );
                        return {
                            ...order.toObject(),
                            images: detailedProducts[0].images,
                            name: detailedProducts[0].name,
                            total: detailedProducts[0].price * detailedProducts[0].quantityUserBuy,
                            quantity: detailedProducts[0].quantityUserBuy,
                        };
                    }),
                );

                // Trả về kết quả
                return res.status(200).json(data);
            }
            if (findUser.isAdmin === true) {
                const historyOrder = await modelPayments.find({ statusOrder: params });
                const data = await Promise.all(
                    historyOrder.map(async (order) => {
                        const detailedProducts = await Promise.all(
                            order.products.map(async (product) => {
                                const findProduct = await modelProducts.findById(product.productId);

                                return {
                                    ...findProduct.toObject(), // Chuyển document MongoDB thành object
                                    quantityUserBuy: product.quantity,
                                };
                            }),
                        );
                        return {
                            ...order.toObject(),
                            images: detailedProducts[0].images,
                            name: detailedProducts[0].name,
                            total: detailedProducts[0].price * detailedProducts[0].quantityUserBuy,
                            quantity: detailedProducts[0].quantityUserBuy,
                        };
                    }),
                );

                return res.status(200).json(data);
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async editOrder(req, res) {
        const { id } = req.decodedToken;
        const { statusOrder, idOrder } = req.body;
        if (!statusOrder || !idOrder) return res.status(400).json({ message: 'Thiếu thông tin' });

        const findUser = await modelUser.findOne({ _id: id });
        ///// users
        if (statusOrder === 'cancelled') {
            await modelPayments.findOneAndUpdate({ userId: id, _id: idOrder }, { statusOrder });
            const findOder = await modelPayments.findOne({ _id: idOrder });
            await modelProducts.findOneAndUpdate(
                { _id: findOder.products[0].productId },
                { $inc: { quantity: findOder.products[0].quantity } },
            );

            return res.status(200).json({ message: 'Huỷ đơn hàng thành công' });
        }

        //// admin
        if (statusOrder === 'delivered') {
            if (findUser.isAdmin === true) {
                const product = await modelPayments.findOneAndUpdate({ _id: idOrder }, { statusOrder });

                await modelProducts.findOneAndUpdate(
                    { _id: product.products[0].productId },
                    { $inc: { countBuy: +product.products[0].quantity } },
                );
                return res.status(200).json({ success: true });
            }
        }

        if (statusOrder === 'completed') {
            if (findUser.isAdmin === true) {
                await modelPayments.findOneAndUpdate({ _id: idOrder }, { statusOrder });
                return res.status(200).json({ success: true });
            } else {
                return res.status(400).json({ message: 'Bạn không có quyền' });
            }
        }

        if (statusOrder === 'shipping') {
            if (findUser.isAdmin === true) {
                await modelPayments.findOneAndUpdate({ _id: idOrder }, { statusOrder });
                return res.status(200).json({ success: true });
            } else {
                return res.status(400).json({ message: 'Bạn không có quyền' });
            }
        }
    }
}

module.exports = new controllerPayments();
