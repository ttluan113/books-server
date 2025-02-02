const usersRoutes = require('../users/users.routes');
const productsRoutes = require('../products/products.routes');
const cartRoutes = require('../cart/cart.routes');
const discountRoutes = require('../discount/discount.routes');
const paymentsRoutes = require('../payments/payments.routes');
const commentRoutes = require('../comments/comments.routes');
const notifyRoutes = require('../notify/notify.routes');
const messageRoutes = require('../messages/message.routes');
const feedbackRoutes = require('../feedback/feedback.routes');
const categoryRoutes = require('../category/category.routes');

function routes(app) {
    // users
    app.post('/api/register', usersRoutes);
    app.get('/api/auth', usersRoutes);
    app.get('/api/logout', usersRoutes);
    app.post('/api/login', usersRoutes);
    app.get('/api/search-address', usersRoutes);
    app.post('/api/edit-user', usersRoutes);

    // products
    app.post('/api/add-product', productsRoutes);
    app.get('/api/get-products', productsRoutes);
    app.get('/api/get-product', productsRoutes);

    ///// category
    app.post('/api/add-category', categoryRoutes);
    app.get('/api/category', categoryRoutes);

    /// carts
    app.post('/api/add-cart', cartRoutes);
    app.get('/api/cart', cartRoutes);
    app.delete('/api/delete-product', cartRoutes);
    app.delete('/api/delete-cart', cartRoutes);

    /// discount
    app.post('/api/add-discount', discountRoutes);
    app.post('/api/add-user-discount', discountRoutes);

    /// payments
    app.post('/api/payment', paymentsRoutes);
    app.get('/api/check-payment-momo', paymentsRoutes);
    app.get('/api/check-payment-vnpay', paymentsRoutes);
    app.get('/api/checkout', paymentsRoutes);

    app.get('/api/history-order', paymentsRoutes);
    app.post('/api/edit-order', paymentsRoutes);

    // comment
    app.post('/api/add-comment', commentRoutes);
    app.get('/api/comments', commentRoutes);

    /// notify
    app.post('/api/add-notify', notifyRoutes);
    app.get('/api/notify', notifyRoutes);
    app.post('/api/read-all-notify', notifyRoutes);

    // message
    app.post('/api/create-message', messageRoutes);
    app.get('/api/messages', messageRoutes);

    /// feedback
    app.post('/api/add-feedback', feedbackRoutes);
    app.get('/api/feedback', feedbackRoutes);
}

module.exports = routes;
