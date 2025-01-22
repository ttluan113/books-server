const usersRoutes = require('../users/users.routes');
const productsRoutes = require('../products/products.routes');
const cartRoutes = require('../cart/cart.routes');
const discountRoutes = require('../discount/discount.routes');
const paymentsRoutes = require('../payments/payments.routes');
const commentRoutes = require('../comments/comments.routes');

function routes(app) {
    // users
    app.post('/api/register', usersRoutes);
    app.get('/api/auth', usersRoutes);
    app.get('/api/logout', usersRoutes);
    app.post('/api/login', usersRoutes);
    app.get('/api/search-address', usersRoutes);

    // products
    app.post('/api/add-product', productsRoutes);
    app.get('/api/get-products', productsRoutes);
    app.get('/api/get-product', productsRoutes);

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

    // comment
    app.post('/api/add-comment', commentRoutes);
    app.get('/api/comments', commentRoutes);
}

module.exports = routes;
