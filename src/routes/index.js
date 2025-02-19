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
const discountProductRoutes = require('../discountProduct/discountProduct.routes');
const statisticalRoutes = require('../statistical/statistical.routes');
const blogsRoutes = require('../blogs/blogs.routes');

function routes(app) {
    // users
    app.post('/api/register', usersRoutes);
    app.get('/api/auth', usersRoutes);
    app.get('/api/logout', usersRoutes);
    app.post('/api/login', usersRoutes);
    app.get('/api/search-address', usersRoutes);
    app.post('/api/edit-user', usersRoutes);
    app.get('/api/refresh-token', usersRoutes);
    app.get('/api/get-all-user', usersRoutes);
    app.post('/api/create-address', usersRoutes);
    app.delete('/api/delete-address', usersRoutes);
    app.post('/api/heart-product', usersRoutes);
    app.get('/api/get-heart-product', usersRoutes);
    app.get('/api/get-heart-product-user', usersRoutes);
    app.post('/api/forgot-password', usersRoutes);
    app.post('/api/reset-password', usersRoutes);
    app.post('/api/login-google', usersRoutes);
    app.post('/api/verify-account', usersRoutes);

    // products
    app.post('/api/add-product', productsRoutes);
    app.get('/api/get-products', productsRoutes);
    app.get('/api/get-product', productsRoutes);
    app.delete('/api/delete-product', productsRoutes);
    app.put('/api/edit-product', productsRoutes);
    app.get('/api/product-top-buy', productsRoutes);
    app.get('/api/product-flash-sale', productsRoutes);
    app.get('/api/search-product', productsRoutes);

    ///// category
    app.post('/api/add-category', categoryRoutes);
    app.get('/api/category', categoryRoutes);
    app.delete('/api/delete-category', categoryRoutes);
    app.post('/api/edit-category', categoryRoutes);

    /// carts
    app.post('/api/add-cart', cartRoutes);
    app.get('/api/cart', cartRoutes);
    app.delete('/api/delete-product-cart', cartRoutes);
    app.delete('/api/delete-cart', cartRoutes);

    /// discount
    app.post('/api/add-discount', discountRoutes);
    app.post('/api/add-user-discount', discountRoutes);
    app.get('/api/discount', discountRoutes);
    app.delete('/api/delete-discount', discountRoutes);

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
    app.post('/api/read-notify', notifyRoutes);

    // message
    app.post('/api/create-message', messageRoutes);
    app.get('/api/messages', messageRoutes);
    app.get('/api/message', messageRoutes);

    /// feedback
    app.post('/api/add-feedback', feedbackRoutes);
    app.get('/api/feedback', feedbackRoutes);

    //// discount product
    app.post('/api/create-discount-product', discountProductRoutes);
    app.get('/api/get-discount-product', discountProductRoutes);
    app.delete('/api/delete-discount-product', discountProductRoutes);

    //// statistical
    app.get('/api/statistical', statisticalRoutes);

    // blgos
    app.post('/api/create-blog', blogsRoutes);
    app.get('/api/blogs', blogsRoutes);
    app.get('/api/blog', blogsRoutes);
    app.delete('/api/delete-blog', blogsRoutes);

    app.get('/api/admin', usersRoutes);
}

module.exports = routes;
