var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({ name: {type:String, required :true},
                          email: {type:String, required :true},
                          message: {type:String, required :true},
                          date: {type : Date, default : Date.now()}
             });

var userMessage = mongoose.model('UserMail', schema);

module.exports = userMessage;