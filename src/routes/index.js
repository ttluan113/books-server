const usersRoutes = require('../users/users.routes');
const productsRoutes = require('../products/products.routes');
const cartRoutes = require('../cart/cart.routes');

function routes(app) {
    // users
    app.post('/api/register', usersRoutes);
    app.get('/api/auth', usersRoutes);
    app.get('/api/logout', usersRoutes);
    app.post('/api/login', usersRoutes);

    // products
    app.post('/api/add-product', productsRoutes);
    app.get('/api/get-products', productsRoutes);
    app.get('/api/get-product', productsRoutes);

    /// carts
    app.post('/api/add-cart', cartRoutes);
    app.get('/api/cart', cartRoutes);
    app.delete('/api/delete-product', cartRoutes);
    app.delete('/api/delete-cart', cartRoutes);
}

module.exports = routes;
