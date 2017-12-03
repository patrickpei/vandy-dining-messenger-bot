let Location = require('./models/location');

let getAverageFoodRating = (locationName, foodName) => {
    Location.find({'name': locationName}, function(err, location) {
        if (err) return console.error(err);
        for (let i = 0; i <= location.foods.length; i++) {
            if (location.foods[i].name === foodName) {
                return location.foods[i].averageRating;
            }
        }
        return -1;
    });
};

let getUserFoodRating = (locationName, foodName, username) => {
    Location.find({'name': locationName}, function(err, location) {
        if (err) return console.error(err);
        for (let i = 0; i <= location.foods.length; i++) {
            if (location.foods[i].name === foodName) {
                let food = location.foods[i];
                for (let j = 0; j <= food.userRatings.length; j++) {
                    if (food.userRatings[j].username === username) {
                        return food.userRatings[j].score;
                    }
                }
            }
        }
        return -1;
    });
};

let setUserFoodRating = (locationName, foodName, userName, score) => {
    Location.find({'name': locationName}, function(err, location) {
        if (err) return console.error(err);
        for (let i = 0; i <= location.foods.length; i++) {
            if (location.foods[i].name === foodName) {
                let food = location.foods[i];
                // if user is found, change their score and update all ratings
                for (let j = 0; j <= food.userRatings.length; j++) {
                    if (food.userRatings[j].username === username) {
                        food.averageRating = food.averageRating + (score - food.userRatings[j].score) / food.totalRatings;
                        food.userRatings[j].score = score;
                        location.save();
                        return console.log('Updated food rating');
                    }
                }
                // if here, no user found, must add into the database
                food.userRatings.push({username: userName, score: score});
                if (food.totalRatings === 0) {
                    food.averageRating = score;
                } else {
                    food.averageRating = food.averageRating /(food.totalRatings + 1 / (food.totalRatings)) + score / (food.totalRatings + 1);
                }
                food.totalRatings += 1;
                location.save();
                return console.log('Updated food rating');
            }
        }
    });
};


module.exports = {
    getAverageFoodRating: getAverageFoodRating,
    getUserFoodRating: getUserFoodRating,
    setUserFoodRating: setUserFoodRating
};

