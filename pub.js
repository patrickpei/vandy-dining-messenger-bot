const dotenv = require('dotenv');
const fetch = require('node-fetch');

const addPubOrder = require('./datastore/firebase/rest').addPubOrder;
const deletePubOrder = require('./datastore/firebase/rest').deletePubOrder;
const getUserPubOrders = require('./datastore/firebase/rest').getUserPubOrders;

dotenv.config();

const checkOrders = async () => {
    if (!isPubOpen()) {
        console.log(`Pub is not open now. Not checking orders.`);
        return;
    }

    console.log(`Checking users' pub orders...`);

    const preparedOrders = new Set(await getPreparedOrders());
    const userPubOrders = await getUserPubOrders();
    console.log('preparedOrders: ', preparedOrders);
    console.log('userPubOrders: ', JSON.stringify(userPubOrders));

    for (let userId in userPubOrders) {
        let userOrder = parseInt(userPubOrders[userId], 10);
        if (!preparedOrders.has(userOrder)) {
            continue;
        }

        console.log(`Found order #${userOrder} for ${userId}`);
        try {
            sendOrderReadyMessage(userId, userOrder);
            deletePubOrder(userId, userOrder);
        } catch (err) {
            console.error(err);
        }
    }
};

function getPreparedOrders() {
    const baseUrl = process.env.prod === 'true' ? `https://vde-bot.herokuapp.com/orders`
                                                : `https://vde-bot.herokuapp.com/orders`;
    const options = {
        headers: { 'Content-Type': 'application/json' },
        method: 'GET'
    };

    return fetch(baseUrl, options)
        .then(res => res.text())
        .then(JSON.parse)
        .catch(console.error);
}

/**
 * Pub is open is 11:00am CT at the earliest, 9:00pm CT at the latest
 * Will ping from 11:00am -  10:00pm CT (in case orders unfilled at 9pm)
 *              = 11:00 - 22:00 CT
 *              = 17:00 - 04:00 UTC (UTC is 6 hours ahead of CT)
 */
function isPubOpen() {
    let date = new Date();
    let utcHour = date.getUTCHours();

    return utcHour >= 17 || utcHour <= 4;
}

function sendOrderReadyMessage(userId, userOrder) {
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

module.exports = checkOrders;
