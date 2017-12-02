'use strict';

const
    bodyParser = require('body-parser'),
    // checkOrders = require('./orders'),
    configureRoutes = require('./routes'),
    express = require('express'),
    morgan = require('morgan');

const app = express();
app.use(bodyParser.json());
app.use(morgan('combined'));
configureRoutes(app);

app.listen(process.env.PORT || 1337, () => console.log('[webhook]: listening'));
