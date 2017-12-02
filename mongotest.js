let mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:6969', { useMongoClient: true });

let User = require('./models/user');
let Location = require('./models/location');
let Food = require('./models/food');


// let User = mongoose.model('User', User);
// let Location = mongoose.model('Location');
// let Food = mongoose.model('Food');


// test
let globe = new User({ username: 'globe' });
globe.save(function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log('meow');
    }
});
//
// User.find(function (err, globe) {
//     if (err) return console.error(err);
//     console.log(globe);
// });
