"use strict";
let mongoose            = require('mongoose'),
    Schema              = mongoose.Schema;

let Rating = new Schema({
    totalRatings: {type: Number},
    averageRating: {type: Number}
});

let Food = new Schema({
    name: {type: String, required: true},
    rating: {type: [Rating]}
});

Food.pre('save', function(next) {
   this.name = this.name.toLowerCase();
   next();
});

module.exports = mongoose.model('Food', Food);