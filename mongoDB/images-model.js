var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({ name    : { type: String},
                          created : { type: Date, default: Date.now() },
                          imgURL  : { type: String },
                          size    : { type: Number },
             });

var ImagesModel = mongoose.model('images_list', schema);

module.exports = ImagesModel;