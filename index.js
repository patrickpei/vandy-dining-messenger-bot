const bodyParser = require('body-parser');
const checkPubOrders = require('./pub');
const configureRoutes = require('./routes');
const defaultPort = 1337;
const dotenv = require('dotenv');
const express = require('express');
const morgan = require('morgan');

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(morgan('combined'));
configureRoutes(app);

setInterval(checkPubOrders, 15000);

app.listen(process.env.PORT || defaultPort, () => console.log('[webhook]: listening'));
