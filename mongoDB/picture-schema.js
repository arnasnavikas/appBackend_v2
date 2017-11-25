var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({  name:        {type: String, default: 'no data'},
                           imgURL:      {type: String, default: 'no data'},
                           group_id:    {type: String},
                           gallery_id:  {type: String},
                           group_folder:{type:String},
                           folder_name: {type: String},
                           gallery_name:{type: String},
                           description: {type: String, default: ''},
                           size:        {type: Number, default: 0        },
                           created:     {type: Number, default: Date.now() }
             });

var PictureModel = mongoose.model('picture', schema);

module.exports = PictureModel;
