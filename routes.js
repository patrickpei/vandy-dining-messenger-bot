const fetch = require('node-fetch');
const superagent = require('superagent');
const rq = require('request');

const welcomeMessage = 'Welcome to Vanderbilt Dining Experience (VDE). How may I help you?';
let fakeOrders = [];

let configureRoutes = app => {
    app.get('/', getBase);

    app.get('/webhook', getBase);

    app.post('/', (req, res) => {
        console.log('post/');
        console.log('body: ', JSON.stringify(req.body));
        const requestBody = req.body;

        // Page subscriptions only
        if (requestBody.object !== 'page') {
            res.sendStatus(404);
            return;
        }

        const entries = requestBody.entry;
        entries.forEach(entry => {
            // Gets the message. only ever 1 element in entry.messaging (Array)
            console.log('entry: ', JSON.stringify(entry));
            const message = entry.messaging[0];
            const url = `https://graph.facebook.com/v2.6/me/messages?access_token=${process.env.access_token}`;
            let body = {
                'messaging_type': 'RESPONSE',
                'recipient': {
                    'id': message.sender.id
                },
                'message': {
                    'text': ''
                }
            };

            let text = message.message.text;
            if (text !== undefined) {
                text = text.toLowerCase();
                
                if (text.includes('pub')) {
                    const match = text.match(/\d+/g);
                    if (match === null) {
                        body.message.text = `Did you include your Pub order number?`;
                    } else if (match.length != 1) {
                        body.message.text = `We detected multiple numbers in your message. Please only include your own pub number.`;
                    } else if (match.length == 1) {
                        const num = match[0];
                        body.message.text = `Tracking Pub Order #${num} for you.`;
                    }
                } else {
                    body.message.text = welcomeMessage;
                }
            } else {
                body.message.text = welcomeMessage;
            }

            const options = {
                body: JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' },
                method: 'POST'
            };

            fetch(url, options)
                .then(res => () => {})
                .catch(console.error);
        });

        res.status(200).send('EVENT_RECEIVED');
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

function getBase(req, res) {
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
}

async function getOrders(req, res) {
    const url = 'http://campusdining.vanderbilt.edu/?action=cmi_yoir&request=orderqueue_ajax&location_id=752';
    const getOrders = () => {
        return fetch(url)
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
