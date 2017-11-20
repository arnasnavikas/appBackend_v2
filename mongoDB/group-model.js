var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({ newMessages : { type: Number, default: 0},
                          gallerys    : { type: Number, default: 0},
                          tables      : { type: Number, default: 0},
                          pavadinimas : { type: String, required:true },
                          imgURL      : { type: String, default: '' },
                          route       : { type: String },
                          aprasymas   : { type: String, default:''},
                          folder_name : { type : String, default: ''}
             });

var CategoryModel = mongoose.model('category_list', schema);

module.exports = CategoryModel;