const express = require('express');
const router = express.Router();

const controllerPayments = require('./payments.controller');

const { authUser } = require('../middleware/authUser');

router.post('/api/payment', authUser, controllerPayments.paymentCod);
router.get('/api/check-payment-momo', authUser, controllerPayments.checkPaymentMomo);
router.get('/api/check-payment-vnpay', authUser, controllerPayments.checkPaymentVnpay);
router.get('/api/checkout', authUser, controllerPayments.getPayment);

router.get('/api/history-order', authUser, controllerPayments.historyOrder);
router.post('/api/edit-order', authUser, controllerPayments.editOrder);

module.exports = router;
