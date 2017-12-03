'use strict';

const
    bodyParser = require('body-parser'),
    // checkOrders = require('./orders'),
    configureRoutes = require('./routes'),
    defaultPort = 1337,
    express = require('express'),
    morgan = require('morgan');

const app = express();
app.use(bodyParser.json());
app.use(morgan('combined'));
configureRoutes(app);

app.listen(process.env.PORT || defaultPort, () => console.log('[webhook]: listening'));
