const fetch = require('node-fetch');
const superagent = require('superagent');

const baseUrl = `https://vde-bot.herokuapp.com/fakeorders`;

const newOrders = [372, 374, 375, 383];
superagent
    .put(baseUrl)
    .send(newOrders)
    .then(res => {
        console.log(res.status);
    });
