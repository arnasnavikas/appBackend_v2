var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({ group_id : String,
                          group_name: String,
                          gallery_name: String,
                          route_name: String,
                          folder_name: String,
                          gallery_images: [{
                                            name:        {type: String, default: 'no data'},
                                            imgURL:      {type: String, default: 'no data'},
                                            description: {type: String, default: ''},
                                            size:        {type: Number, default: 0        },
                                            created:     {type: Number, default: Date.now() }
                          }],
                          birth_time: {type: Number, default: Date.now()},
                          aprasymas: {type: String, default: 'No descrition'},
                          index_img: {type:String, default:null}
             });

var GalleryModel = mongoose.model('gallery', schema);

module.exports = GalleryModel;
