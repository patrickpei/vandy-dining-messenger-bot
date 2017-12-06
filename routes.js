const fetch = require('node-fetch');
const superagent = require('superagent');
const rq = require('request');

let fakeOrders = [];

let configureRoutes = app => {
    app.get('/', (req, res) => {
        const VERIFY_TOKEN = 'WC4y3U^JV@1Ehd^g';
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];
        if (mode && token) {
            // Checks the mode and token sent is correct
            if (mode === 'subscribe' && token === VERIFY_TOKEN) {
                console.log('[webhook]: verified');
                res.status(200).send(challenge);
            } else {
                res.sendStatus(403);
            }
        }
    });

    app.get('/webhook', (req, res) => {
        const VERIFY_TOKEN = 'WC4y3U^JV@1Ehd^g';
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        if (mode && token) {
            // Checks the mode and token sent is correct
            if (mode === 'subscribe' && token === VERIFY_TOKEN) {
                console.log('[webhook]: verified');
                res.status(200).send(challenge);
            } else {
                res.sendStatus(403);
            }
        }
    });

    app.post('/', (req, res) => {
        console.log('post/');
        console.log('body: ', JSON.stringify(req.body));
        let body = req.body;

        // Page subscriptions only
        if (body.object !== 'page') {
            res.sendStatus(404);
            return;
        }

        body.entry.forEach(entry => {
            // Gets the message. entry.messaging is arr, but len = 1 so index 0
            console.log('entry: ', JSON.stringify(entry));
            let webhookEvent = entry.messaging[0];
            console.log('[webhook]: event: ', webhookEvent);
            let uri = "https://graph.facebook.com/v2.6/me/messages";
            const requestBody = {
              'messaging_type': 'RESPONSE',
              'recipient': {
                'id': webhookEvent.sender.id
              },
              'message': {
                'text': "Hello"
              },
            }
            const options = {
              uri: uri,
              qs: {
                "access_token": process.env.access_token
              },
              method: "POST",
              json: requestBody
            };

            function callback(error, response, body) {
              console.log("Error:" + JSON.stringify(error));
              console.log("Response:" + JSON.stringify(response));
              console.log("Body:" + JSON.stringify(body));
            };

            rq(options, callback);
        });

        res.status(200).send('EVENT_RECEIVED');
    });

    app.post('/webhook', (req, res) => {
        let body = req.body;

        // Page subscriptions only
        if (body.object === 'page') {
            body.entry.forEach(function(entry) {
                // Gets the message. entry.messaging is arr, but len = 1 so index 0
                let webhookEvent = entry.messaging[0];
                console.log('[webhook]: event: ', webhookEvent);
            });

            res.status(200).send('EVENT_RECEIVED');
        } else {
            res.sendStatus(404);
        }
    });

    app.get('/orders', getOrders);

    app.get('/fakeorders', (req, res) => {
        res.status(200).send(fakeOrders);
    });

    app.put('/fakeorders', (req, res) => {
        try {
            const arr = req.body;
            if (!arr instanceof Array) {
                res.sendStatus(400);
            }

            fakeOrders = arr;
            res.sendStatus(204);
        } catch (err) {
            console.error(err.message);
            res.sendStatus(500);
        }
    });
}

async function getOrders(req, res) {
    const url = 'http://campusdining.vanderbilt.edu/?action=cmi_yoir&request=orderqueue_ajax&location_id=752';
    const options = {
        method: 'get',
        headers: {
            action: "cmi_yoir",
            request: "orderqueue_ajax",
            location_id: 752
        }
    };

    const getOrders = () => {
        return fetch(url, options)
            .then(res => res.text())
            .then(text => JSON.parse(text))
            .then(orders => orders.map(o => o.order_id))
            .catch(console.error);
    }

    try {
        const orders = await getOrders();
        res.status(200).send(orders);
    } catch (err) {
        res.sendStatus(500);
    }
}

module.exports = configureRoutes;
