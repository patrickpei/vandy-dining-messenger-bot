"use strict";
let mongoose            = require('mongoose'),
    Schema              = mongoose.Schema;

let Food = new Schema({
    name: {type: String, required: true},
    userRatings: [{type: Schema.Types.ObjectId, ref: 'User'}],
    totalRatings: {type: Number, default: 0},
    averageRating: {type: Number, default: 0}
});

Food.pre('save', function(next) {
   this.name = this.name.toLowerCase();
   next();
});

module.exports = mongoose.model('Food', Food);