var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({ newMessages : { type: Number, default: 0},
                          gallerys    : { type: Number, default: 0},
                          user_id    : { type: String},
                          user_folder : { type: String},
                          tables      : { type: Number, default: 0},
                          name        : { type: String, required:true },
                          imgURL      : { type: Array ,default:[] },
                          route       : { type: String },
                          description : { type: String, default:''},
                          folder_name : { type : String, default: ''},
                          table_name  : { type : String, default:undefined}
             });

var CategoryModel = mongoose.model('category_list', schema);

module.exports = CategoryModel;