var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({ 
                          email     : { type : String, required:false},
                          address   : { type: Object, required:false},
                          date      : { type: Date   , default: Date.now() },
                          confirm   : { type: Boolean, default:false },
                          ziuretas  : { type: Boolean, default:false },
                          atsakymas : { type: String , default: undefined },
                          forname   : { type: String , required:false },
                          message   : { type: String , required:false },
                          mobile    : { type: String , required:false },
                          name      : { type: String , required:false },
                          suma      : { type: Number , required:false },
                          tableData : { type: Array  , required:false },
             });

var MessageModel = mongoose.model('UserMail', schema);

module.exports = MessageModel;