const usersRoutes = require('../users/users.routes');

function routes(app) {
    app.post('/api/register', usersRoutes);
    app.get('/api/auth', usersRoutes);
    app.get('/api/logout', usersRoutes);
    app.post('/api/login', usersRoutes);
}

module.exports = routes;
