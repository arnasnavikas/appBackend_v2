var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({ newMessages : { type: Number},
                          pavadinimas : { type: String, required:true },
                          imgURL      : { type: String },
                          route       : { type: String },
                          aprasymas   : { type: String, default:''}
             });

var CategoryModel = mongoose.model('category_list', schema);

module.exports = CategoryModel;