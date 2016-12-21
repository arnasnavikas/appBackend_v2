var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({ 
                          gallery_name: String,
                          route_name: String,
                          gallery_images: [{
                                            img_name:    {type: String, default: 'no data'},
                                            img_src:     {type: String, default: 'no data'},
                                            description: {type: String, default: ''},
                                            size:        {type: Number, default: 0        },
                                            sukurta:     {type: Number, default: Date.now() }
                          }],
                          birth_time: {type: Number, default: Date.now()},
                          aprasymas: {type: String, default: 'No descrition'},
                          index_img: {type:String, default:'http://icons.iconarchive.com/icons/oxygen-icons.org/oxygen/256/Places-folder-red-icon.png'}
             });

var GalleryModel = mongoose.model('gallery', schema);

module.exports = GalleryModel;
