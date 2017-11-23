var express = require('express');
var router = express.Router();
var fs = require ('fs-extra');
var async = require ('async');
var custom_paths = require('./paths');
var GalleryModel = require('../mongoDB/gallery_schema');


/*##############################################################
 Delete pictures from folder 
 ###############################################################*/
router.put('/:group/:folder/:groupId', function(req,res,next){
  var body = JSON.parse(req.body.data);
  var groupName = req.params.group;
  var folderName = req.params.folder;
  var groupId = req.params.groupId;
        (function iterator(i){
          if(i >= body.length){
            res.json({message: 'Pictures deleted successfuly.',data:body})
            return;
          } 
          async.waterfall([
            // finds pictures object in database by given _id ;
            function(call){
              GalleryModel.findOne({gallery_images:{$elemMatch:{_id:body[i]}}},
                                   {"gallery_images.$":1},
                                               function(err,data){
                                                 if(err){call(err);return;}
                                                 call(null,data.gallery_images[0]);
                                               });
            }
            // removes picture from fyle sysytem by given picture name;
            ,function(image,call){
              fs.remove(custom_paths.public_folder+groupName+'/'+folderName+'/'+image.name, function(err){
                if(err){ call(err); return; }
                call(null,image._id);
              });
            // removes picture from database by given _id;
            },function(id,call){
              GalleryModel.update({route_name:folderName},
                                  {$pull:{gallery_images:{_id:id}}},
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
