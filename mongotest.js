var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/test', { useMongoClient: true })
    .then(() => {
        console.log('\t MongoDB connected');

        // Import our Data Models
        app.models = {
            User: require('./models/user'),
            Location: require('./models/location'),
            Food: require('./models/food')
        };

        // Import our API Routes
        require('./api/v1/game')(app);
        require('./api/v1/user')(app);
        require('./api/v1/session')(app);
    }, err => {
        console.log(err);
    });
