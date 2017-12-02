"use strict";

let mongoose            = require('mongoose'),
    Schema              = mongoose.Schema;

let User = new Schema({
    username:    {type: String, required: true},
    locations: [{ type: Schema.Types.ObjectId, ref: 'Location' }]
});

User.pre('save', function(next) {
   this.username = this.username.toLowerCase();
});

module.exports = mongoose.model('User', User);