var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({ name: {type:String, required :true},
                          email: {type:String, required :true},
                          message: {type:String, required :true},
                          date: {type : Date, default : Date.now()},
                          confirm: {type: Boolean, required: true},
                          tableData: {type: Array, default: []},
                          suma: {type: String, default : '0'}
             });

var MessageModel = mongoose.model('UserMail', schema);

module.exports = MessageModel;