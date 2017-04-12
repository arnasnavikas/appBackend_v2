var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({ vardas : { type: String},
                          amzius : { type: String },
                          issilavinimas : { type: String },
                          pomegiai : { type: String},
                          pazymejimai: [{foto:String,
                                        description:String}]
             });

var MyResumeModel = mongoose.model('my_resume', schema);

module.exports = MyResumeModel;