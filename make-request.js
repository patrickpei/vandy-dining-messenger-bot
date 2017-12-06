const superagent = require('superagent');

const body = {
    "object": "page",
    "entry": [
        {
            "id": "1493965664019650",
            "time": 1512588660048,
            "messaging": [{
                "sender": { "id": "1640865482602100" },
                "recipient": { "id": "1493965664019650" },
                "timestamp": 1512588659753,
                "message": {
                    "mid": "mid.$cAAVOwMApF6hmXpSUKVgLU9LoJmg1",
                    "seq": 1506297,
                    "text": "Yo Melvin"
                }
            }]
        }]
};

superagent.post('localhost:5000/')
    .send(body)
    .then(res => {
        console.log('res: ', res);
    })
    .catch(console.error);
