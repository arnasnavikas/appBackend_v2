var express = require('express');
var router = express.Router();
var fs = require ('fs-extra');
var async = require ('async');
var custom_paths = require('./paths');
var GalleryModel = require('../mongoDB/gallery_schema');


/*##############################################################
 Delete pictures from folder 
 ###############################################################*/
router.put('/delete/:gallery_id', function(req,res,next){
  var body = JSON.parse(req.body.data);
  var gallery_id = req.params.gallery_id;
        (function iterator(i){
          if(i >= body.length){
            res.json({message: 'Pictures deleted successfuly.',data:body})
            return;
          } 
          async.waterfall([
            // finds pictures object in database by given _id ;
            function(call){
              GalleryModel.findOne({_id:gallery_id},function(err,gallery){
                                                 if(err){call(err);return;}
                                                 call(null,gallery);
                                               });
            }
            // removes picture from fyle sysytem by given picture name;
            ,function(gallery,call){
                console.log(gallery.gallery_images)
                for(var id of body){
                    for(var image of gallery.gallery_images){
                        if(id== image._id){
                            var image_path = custom_paths.public_folder+'/'+gallery.group_name+'/'+gallery.folder_name+'/'+image.name;
                            console.log('picture deleted at')
                            console.log(image_path)
                            fs.remove(image_path, function(err){
                              if(err){ call(err); return; }
                            });
                            call(null,image._id);
                        }
                    }
                }
            // removes picture from database by given _id;
            },function(image_id,call){
              GalleryModel.update({_id:gallery_id},
                                  {$pull:{gallery_images:{_id:image_id}}},
                                  function(err,data){
                                    if(err){ call(err); return; }
                                    call(null,null);
                                  });
            }
          ],function(err,call){
            if(err){ res.json(err); return }
            iterator(i+1)
          });
        })(0);
  });
  

module.exports = router;
