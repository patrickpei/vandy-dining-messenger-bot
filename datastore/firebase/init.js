/**
 * Do not accidentally run this
 */

const dotenv = require('dotenv');
const fetch = require('node-fetch');

dotenv.config();

const initDatabase = async () => {
    const baseUrl = `https://vde-bot.firebaseio.com/.json?auth=${process.env.firebase_auth}`;
    const options = {
        body: JSON.stringify({
            "pubOrders": {
                "dummyId": 0
            },
            "ratings": {
                "dummyId": "dummyValue"
            }
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'PUT'
    };

    fetch(baseUrl, options)
        .then(res => res.text())
        .then(console.log);
};

initDatabase();
