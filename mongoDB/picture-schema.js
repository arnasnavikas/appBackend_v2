var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({  name:        {type: String},
                           imgURL:      {type: String},
                           user_id:     {type: String},
                           group_id:    {type: String},
                           gallery_id:  {type: String},
                           user_folder: {type:String},
                           group_folder:{type:String},
                           folder_name: {type: String},
                           private :    {type: Boolean},
                           gallery_name:{type: String},
                           description: {type: String,default :''},
                           size:        {type: Number},
                           created:     {type: Number}
             });

var PictureModel = mongoose.model('picture', schema);

module.exports = PictureModel;
