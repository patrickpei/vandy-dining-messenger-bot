'use strict';

const bodyParser = require('body-parser');
const checkPubOrders = require('./pub-orders');
const configureRoutes = require('./routes');
const defaultPort = 1337;
const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(morgan('combined'));
configureRoutes(app);

setInterval(checkPubOrders, 15000);

app.listen(process.env.PORT || defaultPort, () => console.log('[webhook]: listening'));
