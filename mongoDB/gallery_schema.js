var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({ group_id : String,
                          group_folder: String,
                          user_folder: String,
                          user_id: String,
                          name: String,
                          route: String,
                          folder_name: String,
                          gallery_images: {type:Number,default: 0},
                          birth_time: {type: Number, default: Date.now()},
                          description: {type: String, default: 'No descrition'},
                          index_img: {type:Object, default:{imgURL:"https://5.imimg.com/data5/NT/QU/MY-3701638/pvc-file-folder-500x500.jpg"}}
             });

var GalleryModel = mongoose.model('gallery', schema);

module.exports = GalleryModel;
