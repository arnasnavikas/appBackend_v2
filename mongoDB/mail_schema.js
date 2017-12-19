var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var schema = new Schema({ user_id : { type: String, default:''},
                          name    : { type: String, required:false},
                          email   : { type: String, required:false},
                          message : { type: String, required:false},
                          address : { type: String, required:false},
                          date    : { type: Number,   default: new Date().getTime()},
                          newMail : { type: Boolean,default: true},
                          answer  : { type: String, default: undefined},
                          samata  : { type: Array,  required:false},
             });

var MessageModel = mongoose.model('UserMail', schema);

module.exports = MessageModel;