var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({ group_id  : { type: String, default:'' },
                          email     : { type: String, required:false},
                          address   : { type: Object, default:{city:'nėra',
                                                               street: 'nėra',
                                                               district: 'nėra',
                                                               postCode: 'nėra'
                                                              }, required:false},
                          date      : { type: Date   , default: Date.now() },
                          confirm   : { type: Boolean, default:false },
                          ziuretas  : { type: Boolean, default:false },
                          atsakymas : { type: String , default: undefined },
                          forname   : { type: String , required:false, default:'nėra'},
                          message   : { type: String , required:false },
                          mobile    : { type: String , required:false, default:'nėra' },
                          name      : { type: String , required:false },
                          suma      : { type: Number , required:false },
                          tableData : { type: Array  , required:false },
             });

var MessageModel = mongoose.model('UserMail', schema);

module.exports = MessageModel;