const dotenv = require('dotenv');
const fetch = require('node-fetch');

const getUserPubOrders = require('./datastore/firebase/rest').getUserPubOrders;
const addPubOrder = require('./datastore/firebase/rest').addPubOrder;

dotenv.config();

const getPreparedOrders = () => {
    const baseUrl = `https://vde-bot.herokuapp.com/fakeorders`;
    const options = {
        headers: { 'Content-Type': 'application/json' },
        method: 'GET'
    };

    return fetch(baseUrl, options)
        .then(res => res.text())
        .then(JSON.parse)
        .catch(console.error);
}

const checkOrders = async () => {
    console.log(`Checking users' pub orders...`);

    const preparedOrders = new Set(await getPreparedOrders());
    console.log('preparedOrders: ', preparedOrders);
    const userPubOrders = await getUserPubOrders();
    console.log('userPubOrders: ', JSON.stringify(userPubOrders));    
    for (let userId in userPubOrders) {
        let userOrder = userPubOrders[userId];
        if (!preparedOrders.has(userOrder)) {
            continue;
        }

        console.log(`Found order #${userOrder} for ${userId}`);
        // 1. Remove order
        // 2. Message this bigboi
        const url = `https://graph.facebook.com/v2.6/me/messages?access_token=${process.env.fb_access_token}`;
        const body = {
            'message': {
                'text': `Pub order #${userOrder} is ready!`
            },
            'messaging_type': 'MESSAGE_TAG',
            'recipient': {
                'id': userId
            },
            'tag': 'PAIRING_UPDATE'
        };
        const options = {
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
            method: 'POST'
        };

        console.log(options);
        fetch(url, options)
            .then(res => res.text())
            .then(console.log)
            .catch(console.error);

    }
};

module.exports = checkOrders;
