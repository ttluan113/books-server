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

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
