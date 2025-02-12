const express = require('express');
const app = express();
const port = 5001;
const routes = require('./routes');
const cors = require('cors');
const connectDB = require('./config');
const cookieParser = require('cookie-parser');
const path = require('path');
const bodyParser = require('body-parser');
const { jwtDecode } = require('jwt-decode');
const { verifyToken } = require('./services/token');

const { UnauthorizedError } = require('./core/error.response');
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

global._io = io;
const userSockets = new Map();
global._userSockets = userSockets;

require('dotenv').config();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

connectDB();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.static(path.join(__dirname, '../src')));

app.use(async (req, res, next) => {
    const token = req.cookies?.token;

    if (!token) {
        return next(); // Không có token thì tiếp tục request
    }

    try {
        const decodedToken = jwtDecode(token); // Không cần await
        const validToken = await verifyToken(token, decodedToken.id);

        if (!validToken) {
            res.clearCookie('token');
            return next(new UnauthorizedError('Unauthorized'));
        }

        req.decodedToken = validToken;
        next();
    } catch (error) {
        next(error); // Đảm bảo request không bị treo
    }
});

app.use((req, res, next) => {
    res.io = io;
    next();
});

routes(app);

io.on('connection', (socket) => {
    const token = socket.handshake.headers.cookie
        ?.split(';')
        .find((cookie) => cookie.trim().startsWith('token='))
        ?.split('=')[1]; // Optional chaining để tránh lỗi nếu không có token

    if (!token) {
        console.log('No token found!');
        socket.disconnect(); // Nếu không có token, ngắt kết nối
        return;
    }
    try {
        const { id } = jwtDecode(token);
        socket.user = id;
        console.log('a user connected' + id);
        userSockets.set(id, socket);
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    } catch (error) {
        console.log(error);
    }
});

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
