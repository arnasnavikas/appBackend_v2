var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({ 
                          gallery_name: String,
                          gallery_images: [{
                                            img_name:    {type: String, default: 'no data'},
                                            img_src:     {type: String, default: 'no data'},
                                            img_dest:    {type: String, default: 'no data'},
                                            description: {type: String, default: 'no data'},
                                            size:        {type: Number, default: 0        },
                                            sukurta:     {type: Number, default: Date.now() }
                          }]
             });

var GalleryModel = mongoose.model('gallery', schema);

module.exports = GalleryModel;
