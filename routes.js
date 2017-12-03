const fetch = require('node-fetch');
const request = require('superagent');
const rq = require('request');

let configureRoutes = app => {
    app.get('/', (req, res) => {
        const VERIFY_TOKEN = 'WC4y3U^JV@1Ehd^g';
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];
        console.log('Check me out in the console!')
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
        let body = req.body;

        // Page subscriptions only
        if (body.object === 'page') {
            body.entry.forEach(function(entry) {
                // Gets the message. entry.messaging is arr, but len = 1 so index 0
                let webhookEvent = entry.messaging[0];
                console.log('[webhook]: event: ', webhookEvent);
            });

            // Reply to message
            let uri= "https://graph.facebook.com/v2.6/me/messages";
            // let url = 'https://graph.facebook.com/v2.6/me/messages?access_token=' +
            //           process.env.access_token;
            const request_body = {
              'messaging_type': 'RESPONSE',
              'recipient': {
                'id': webhookEvent.event.sender.id
              },
              'message': {
                'text': "hello, Yunhua!"
              },
            }
            const options = {
              uri: uri,
              qs: {
                "access_token": process.env.access_token
              },
              method: "POST",
              json: request_body
            };

            function callback(error, response, body) {
              console.log("Error:" + error);
              console.log("Response:" + JSON.stringify(response));
              console.log("Body:" + body);
            };

            rq(options, callback);

            res.status(200).send('EVENT_RECEIVED');
        } else {
            res.sendStatus(404);
        }
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

    app.get('/orders', (req, res) => {
        // const pubLink = 'http://campusdining.vanderbilt.edu/?action=cmi_yoir&request=screen&location_id=752';
        const pubLink = 'http://127.0.0.1:1337/fakeorders';

        request.get(pubLink)
            .end((err, pubRes) => {
                res.status(200).send(pubRes.body);
            });

        // Who made this incompatible with non absolute urls...
        // fetch(pubLink)
        //     .then(pubRes => {
        //         // console.log(pubRes);
        //         res.status(200).send(pubRes);
        //     });
    });

    app.get('/fakeorders', (req, res) => {
        let numbers = [1, 2, 3];
        res.status(200).send(numbers);
    });

    app.put('/fakeorders', (req, res) => {
        console.log('b', req.body);

        res.status(200).send('hi');
    })
}

module.exports = configureRoutes;
