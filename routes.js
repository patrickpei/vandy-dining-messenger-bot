const fetch = require('node-fetch');
const superagent = require('superagent');
const rp = require('request-promise');
const cheerio = require('cheerio');
const addPubOrder = require('./datastore/firebase/rest').addPubOrder;

String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

const fbUrl = `https://graph.facebook.com/v2.6/me/messages?access_token=${process.env.fb_access_token}`;
const cdUrl = `http://campusdining.vanderbilt.edu/?action=cmi_yoir&request=orderqueue_ajax&location_id=752`
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
                       '`menu open`: get list of currently open restaurants' +
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

    app.post('/', postBase);

    app.get('/orders', getOrders);

    app.get('/fakeorders', getFakeOrders);

    app.put('/fakeorders', putFakeOrders);
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

function getFakeOrders(req, res) {
    res.status(200).send(fakeOrders);
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

async function postBase(req, res) {
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
        const senderId = message.sender.id;
        const userMessage = message.message.text;
        const responseText = getResponse(senderId, userMessage);
        respondToUser(senderId, responseText);
    });

    res.status(200).send('EVENT_RECEIVED');
}

function putFakeOrders(req, res) {
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
}

function getResponse(userId, userMessage) {
    if (userMessage === undefined || userMessage === null || userMessage.length === 0) {
        return welcomeMessage;
    }
    userMessage = userMessage.toLowerCase();

    let result;
    if (userMessage.includes('menu')) {
        if (userMessage === 'menu list') {
            let menuList =
                'Here is the list of available restaurants ' +
                'to query:\n';
            menuList += restaurants.reduce((prev, cur) => `${prev}\n${cur}`);
            result =
                menuList.substring(0, menuList.length - 1);
        } else if (text === 'menu open') {
            const openRestaurants =
                'Here is the list of currently open restaurants ' +
                'to query:\n';
            const openPlaces = await getOpenRestaurants();
            result = openRestaurants + openPlaces.join('\n');
        } else {
            const restaurant = text.substring(5).capitalize();
            if (restaurant === 'Food For Thought Cafe') {
                restaurant[5] = 'f';
            }
            if (restaurant === 'Kissam') {
                restaurant = "The Kitchen";
            }
            console.log(`Getting menu for ${restaurant}.`);
            const menuItems = await getMenuItems(restaurant);
            const menuItemsText = menuItems.join('\n');

            if (menuItemsText.length === 0 || menuItemsText.length > 640) {
                result = `Sorry, for one reason or another, I'm unable ` +
                    `to provide you the menu for ${restaurant} at ` +
                    `this time. Working on a fix!`;
            } else {
                result = menuItemsText;
            }
            console.log('Sent menu items back to user.');
        }
    } else if (text.includes('pub')) {
        const match = text.match(/\d+/g);
        if (match === null) {
            result = `Did you include your Pub order number?`;
        } else if (match.length > 1) {
            result = `We detected multiple numbers in your message. Please only include your own pub number.`;
        } else if (match.length == 1) {
            const num = match[0];
            result = `Tracking Pub Order #${num} for you.`;
            addPubOrder(userId, num);
        }
    } else {
        result = welcomeMessage;
    }

    return result;
}

async function getOrders(req, res) {
    const getOrders = () => {
        return fetch(cdUrl)
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

function respondToUser(userId, responseText) {
    const body = {
        'messaging_type': 'RESPONSE',
        'recipient': {
            'id': senderId
        },
        'message': {
            'text': responseText
        }
    };

    const options = {
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST'
    };

    return fetch(fbUrl, options)
        .then(res => () => {})
        .catch(console.error);
}

module.exports = configureRoutes;
