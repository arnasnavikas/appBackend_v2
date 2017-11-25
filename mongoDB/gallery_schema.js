var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({ group_id : String,
                          group_folder: String,
                          name: String,
                          route: String,
                          folder_name: String,
                          gallery_images: {type:Number,default: 0},
                          birth_time: {type: Number, default: Date.now()},
                          description: {type: String, default: 'No descrition'},
                          index_img: {type:String, default:null}
             });

var GalleryModel = mongoose.model('gallery', schema);

module.exports = GalleryModel;
