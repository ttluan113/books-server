const express = require('express');
const app = express();
const port = 5000;
const routes = require('./routes');
const cors = require('cors');
const connectDB = require('./config');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

require('dotenv').config();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

connectDB();
app.use(cors({ origin: process.env.CLIENT_URL }));
routes(app);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
