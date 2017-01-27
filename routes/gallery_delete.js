var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var async = require('async');
var custom_paths = require('./paths');
var GalleryModel = require('../mongoDB/gallery_schema');

/*##############################################################
 Delete selected gallery folder 
 ###############################################################*/
router.post('/', function(req,res,next){
   var body = JSON.parse(req.body.data);
        (function iterator(i){
          if(i >= body.length){
            res.json({message: 'Gallerys deleted successfuly.'})
            return;
          } 
          async.waterfall([
            // finds gallerys - route name, and _id, by given _id;
            function(call){
              GalleryModel.findOne({_id:body[i]},{ route_name:1 },
                                               function(err,data){
                                                 if(err){call(err);return;}
                                                 call(null,data);
                                               });
            // removes folder from fyle sysytem by given route_name;
            },function(route,call){
              fs.remove(custom_paths.public_images_folder+route.route_name, function(err){
                if(err){ call(err); return; }
                call(null,route._id);
              });
            // removes gallery from database by given _id;
            },function(id,call){
              GalleryModel.remove({_id:id },function(err){
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