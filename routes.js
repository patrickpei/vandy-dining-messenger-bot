const fetch = require('node-fetch');
const superagent = require('superagent');
const rp = require('request-promise');
const cheerio = require('cheerio');

String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

const restaurants = [
    'Bamboo Bistro',
    'Food for Thought Cafe',
    'Suzie\'s Cafe',
    'Rocket Subs',
    'Bakery',
    'Beverages',
    'Bowls @ CJB',
    'Chef James Bistro',
    'Deli',
    'Fresh Mex',
    'Grill Rand',
    'Orto',
    'Rand/Commons',
    'Salad',
    'Soup',
    'Bowls & Wraps',
    'Brick Oven',
    'Center Island Salad Bar',
    'Chef\'s Table',
    'Common Grounds',
    'Commons',
    'Grill',
    'Pastries & Sweets',
    'Sizzle',
    'Soup Commons',
    'Wok Station',
    'Grins Vegetarian Cafe',
    'Kissam (The Kitchen)',
    'Pi & Leaf',
    'Local Java',
    'The Pub'
];
const welcomeMessage = 'Welcome to Vanderbilt Dining Experience (VDE)!\n\n' +
                       'Available commands:\n\n' +
                       '`menu list`: get list of available restaurants\n\n' +
                       '`menu open`: get list of currently open restaurants`' +
                       `\n\n` +
                       '`menu <restaurant>`: get the current menu for ' +
                       'the specified restaurant\n\n' +
                       'Send any other text to receive this message again.' +
                       '\n\nHelp us get better!: ' +
                       'https://www.facebook.com/vandydiningexp';
let fakeOrders = [372, 374, 394];

let configureRoutes = app => {
    app.get('/', getBase);

    app.get('/webhook', getBase);

<<<<<<< HEAD
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
        entries.forEach(async entry => {
            // Gets the message. only ever 1 element in entry.messaging (Array)
            console.log('entry: ', JSON.stringify(entry));
            const message = entry.messaging[0];
            const url =
                `https://graph.facebook.com/v2.6/me/messages?access_token=` +
                `${process.env.access_token}`;
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
                if (text.includes('menu')) {
                    if (text == 'menu list') {
                        let menu_list =
                            'Here is the list of available restaurants ' +
                            'to query:\n';
                        restaurants.forEach((restaurant) => {
                            menu_list += (restaurant + '\n');
                        });
                        body.message.text =
                            menu_list.substring(0, menu_list.length - 1);
                    } else if (text == 'menu open') {
                        let open_restaurants =
                            'Here is the list of currently open restaurants ' +
                            'to query:\n';
                        let open_places = await getOpenRestaurants();
                        body.message.text = open_restaurants +
                            open_places.join('\n');
                    } else {
                        let restaurant = text.substring(5).capitalize();
                        if (restaurant == 'Food For Thought Cafe') {
                            restaurant[5] = 'f';
                        }
                        if (restaurant == 'Kissam') {
                            restaurant = "The Kitchen";
                        }
                        console.log('Getting menu for ' + restaurant + '.');
                        let menu_items = await getMenuItems(restaurant);
                        let menu_items_text = menu_items.join('\n');
                        body.message.text = menu_items_text.length == 0 ||
                                            menu_items_text.length > 640
                            ? `Sorry, for one reason or another, I'm unable ` +
                              `to provide you the menu for ${restaurant} at ` +
                              `this time. Working on a fix!`
                            : menu_items_text;
                        console.log('Sent menu items back to user.');
                    }
                } else if (text.includes('pub')) {
                    const match = text.match(/\d+/g);
                    if (match === null) {
                        body.message.text =
                            `Did you include your Pub order number?`;
                    } else if (match.length != 1) {
                        body.message.text =
                            `We detected multiple numbers in your message. ` +
                            `Please only include your own pub number.`;
                    } else if (match.length == 1) {
                        const num = match[0];
                        body.message.text =
                            `Tracking Pub Order #${num} for you.`;
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
=======
    app.post('/', postBase);
>>>>>>> Add pub order tracking

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

async function getOpenRestaurants() {
    const options = {
        url: 'http://vanderbilt.mymenumanager.net/',
        transform: function (body) {
            return cheerio.load(body);
        }
    };
    return rp(options)
            .then(($) => {
                let openRestaurants =[];
                let open_concepts = $('.menu_block')
                        .find('div.concept_name');
                for (let i = 0; i < open_concepts.length; ++i) {
                    openRestaurants.push($(open_concepts[i]).text());
                }
                return openRestaurants;
            })
            .catch(console.error);
}

async function getMenuItems(restaurant) {
    const options = {
        url: 'http://vanderbilt.mymenumanager.net/',
        transform: function (body) {
            return cheerio.load(body);
        }
    };
    return rp(options)
            .then(($) => {
                let menu = [];
                let menu_items = $('.menu_block')
                        .find(`div.concept_name:contains(${restaurant})`)
                        .closest('.menu_block')
                        .find('li');
                for (var i = 0; i < menu_items.length; ++i) {
                    menu.push($(menu_items[i]).text());
                }
                return menu;
            })
            .catch(console.error);
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

async function postBase(req, res) {
    console.log('post/');
    console.log('body: ', JSON.stringify(req.body));
    const requestBody = req.body;

    // Page subscriptions only
    if (requestBody.object !== 'page') {
        res.sendStatus(404);
        return;
    }

    const entries = requestBody.entry;
    entries.forEach(async entry => {
        // Gets the message. only ever 1 element in entry.messaging (Array)
        console.log('entry: ', JSON.stringify(entry));
        const message = entry.messaging[0];
        const url =
            `https://graph.facebook.com/v2.6/me/messages?access_token=` +
            `${process.env.fb_access_token}`;
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
            if (text.includes('menu')) {
                if (text == 'menu list') {
                    let menuList =
                        'Here is the list of available restaurants ' +
                        'to query:\n';
                    menuList += restaurants.reduce((prev, cur) => `${prev}\n${cur}`);
                    body.message.text =
                        menuList.substring(0, menuList.length - 1);
                } else if (text == 'menu open') {
                    let openRestaurants =
                        'Here is the list of currently open restaurants ' +
                        'to query:\n';
                    let open_places = await getOpenRestaurants();
                    body.message.text = openRestaurants + open_places.join('\n');
                } else {
                    let restaurant = text.substring(5).capitalize();
                    if (restaurant == 'Food For Thought Cafe') {
                        restaurant[5] = 'f';
                    }
                    if (restaurant == 'Kissam') {
                        restaurant = "The Kitchen";
                    }
                    console.log('Getting menu for ' + restaurant + '.');
                    let menu_items = await getMenuItems(restaurant);
                    let menu_items_text = menu_items.join('\n');
                    body.message.text = menu_items_text.length == 0 ||
                                        menu_items_text.length > 640
                        ? `Sorry, for one reason or another, I'm unable ` +
                          `to provide you the menu for ${restaurant} at ` +
                          `this time. Working on a fix!`
                        : menu_items_text;
                    console.log('Sent menu items back to user.');
                }
            } else if (text.includes('pub')) {
                const match = text.match(/\d+/g);
                if (match === null) {
                    body.message.text =
                        `Did you include your Pub order number?`;
                } else if (match.length != 1) {
                    body.message.text =
                        `We detected multiple numbers in your message. ` +
                        `Please only include your own pub number.`;
                } else if (match.length == 1) {
                    const num = match[0];
                    body.message.text =
                        `Tracking Pub Order #${num} for you.`;
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
}

async function getOrders(req, res) {
    const url =
        'http://campusdining.vanderbilt.edu/?action=cmi_yoir&request' +
        '=orderqueue_ajax&location_id=752';
    const getOrders = () => {
        return fetch(url)
            .then(res => res.text())
            .then(text => JSON.parse(text))
            .then(orders => orders.map(o => parseInt(o.order_id, 10)).sort())
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
