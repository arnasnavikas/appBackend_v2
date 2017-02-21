var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({ vardas : { type: String},
                          amzius : { type: String },
                          issilavinimas : { type: String },
                          image  : { type: String },
                          kita   : { type: String}
             });

var MyResumeModel = mongoose.model('my_resume', schema);

module.exports = MyResumeModel;