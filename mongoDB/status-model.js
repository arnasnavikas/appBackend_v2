var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({status:    { type: Number},
                         message:   { type: String},
                         date:      { type: Date},
                         days_left: { type: Number},
             });

var StatusModel = mongoose.model('status', schema);

module.exports = StatusModel;