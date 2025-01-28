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

app.use((req, res, next) => {
    const token = req.cookies.token;

    if (token) {
        const decodedToken = jwtDecode(token);
        req.decodedToken = decodedToken;
    }
    next();
});

routes(app);

io.on('connect', (socket) => {
    socket.on('disconnect', () => {
        console.log('user disconnected');
        userSockets.set(socket.id, null);
    });
});

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
