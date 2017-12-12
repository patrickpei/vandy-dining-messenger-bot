const dotenv = require('dotenv');
const fetch = require('node-fetch');

dotenv.config();

const addPubOrder = (userId, orderNum) => {
    const baseUrl = `https://vde-bot.firebaseio.com/pubOrders.json?auth=${process.env.firebase_auth}`;
    const options = {
        body: JSON.stringify({
            [userId]: orderNum
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH'
    };

    fetch(baseUrl, options)
        .then(res => res.text())
        .catch(console.error);
};

const deletePubOrder = (userId, orderNum) => {
    const baseUrl = `https://vde-bot.firebaseio.com/pubOrders/${userId}.json?auth=${process.env.firebase_auth}`;
    const options = {
        method: 'DELETE'
    };

    fetch(baseUrl, options)
        .then(res => res.text())
        .catch(console.error);
}

const getUserPubOrder = (userId) => {
    const baseUrl = `https://vde-bot.firebaseio.com/pubOrders/${userId}.json?auth=${process.env.firebase_auth}`;
    const options = {
        headers: { 'Content-Type': 'application/json' },
        method: 'GET'
    };

    return fetch(baseUrl, options)
        .then(res => res.text())
        .catch(console.error);
};

const getUserPubOrders = () => {
    const baseUrl = `https://vde-bot.firebaseio.com/pubOrders/.json?auth=${process.env.firebase_auth}`;
    const options = {
        headers: { 'Content-Type': 'application/json' },
        method: 'GET'
    };

    return fetch(baseUrl, options)
        .then(res => res.text())
        .then(res => JSON.parse(res))
        .catch(console.error);
};

module.exports = {
    addPubOrder,
    getUserPubOrder,
    getUserPubOrders
};
