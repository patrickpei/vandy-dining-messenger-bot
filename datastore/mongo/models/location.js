"use strict";

let mongoose            = require('mongoose'),
    Schema              = mongoose.Schema;

let Location = new Schema({
    name:    {type: String, required: true},
    foods: [{ type: Schema.Types.ObjectId, ref: 'Food' }]
});

Location.pre('save', function(next) {
    this.name = this.name.toLowerCase();
    next();
});

module.exports =  mongoose.model('Location', Location);

