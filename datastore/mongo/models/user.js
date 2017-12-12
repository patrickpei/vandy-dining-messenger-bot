"use strict";

let mongoose            = require('mongoose'),
    Schema              = mongoose.Schema;

let User = new Schema({
    username:    {type: String, required: true},
    score: {type: Number, required: true}
});

User.pre('save', function(next) {
   this.username = this.username.toLowerCase();
   next();
});

module.exports = mongoose.model('User', User);