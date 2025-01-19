const express = require('express');
const router = express.Router();

const controllerPayments = require('./payments.controller');

router.post('/api/payment', controllerPayments.paymentCod);
router.get('/api/check-payment-momo', controllerPayments.checkPaymentMomo);
router.get('/api/check-payment-vnpay', controllerPayments.checkPaymentVnpay);
router.get('/api/checkout', controllerPayments.getPayment);

module.exports = router;
