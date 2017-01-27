var express = require('express');
var router = express.Router();
var fs = require ('fs-extra');
var async = require ('async');
var custom_paths = require('./paths');
var GalleryModel = require('../mongoDB/gallery_schema');



/*##############################################################
 Loads pictures from selected folder
 ###############################################################*/
router.get('/:id', function(req, res, next) {
  var folder_name = req.params.id;
  GalleryModel.findOne({route_name: folder_name},{gallery_images:1,index_img:1},function(err,data){
    if(err){
       res.json({"err": err, message:"Cant load picture from database"});
       return;
    }
       res.json(data);
  });
})
/*##############################################################
 Loads all gallerys folders 
 ###############################################################*/
.get('/', function(req, res, next) {
   GalleryModel.find(function(err,data){
     if(err){
       res.json({message:'Cant load albums.', error: err});
       return;
     }
     res.json(data);
   });
/*##############################################################
 Delete pictures from folder 
 ###############################################################*/
}).put('/:gallery', function(req,res,next){
  var body = JSON.parse(req.body.data);
  var galleryName = req.params.gallery;
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
                                                 console.log(data);
                                                 call(null,data.gallery_images[0]);
                                               });
            }
            // removes picture from fyle sysytem by given picture name;
            ,function(image,call){
              fs.remove(custom_paths.public_images_folder+galleryName+'/'+image.img_name, function(err){
                if(err){ call(err); return; }
                call(null,image._id);
              });
            // removes picture from database by given _id;
            },function(id,call){
              GalleryModel.update({gallery_name: galleryName},
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
