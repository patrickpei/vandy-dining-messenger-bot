let mongoose = require('mongoose');
let mongFuncs = require('./api/mongofunctions');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:6969', { useMongoClient: true });

let User = require('./models/user');
let Location = require('./models/location');
let Food = require('./models/food');


//test
let food = new Food({
    name: 'tort tuesday',
    userRatings: []
});

let rand  = new Location({
    name: 'rand',
    foods: [food]
});


let roger = new User({ username: 'roger', score: 10 });

rand.save(function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log('hi');
    }
});

mongFuncs.setUserFoodRating('rand', 'tort tuesday', 'roger', 5);

Location.find(function (err, rand) {
    if (err) return console.error(err);
    console.log(rand);
});
