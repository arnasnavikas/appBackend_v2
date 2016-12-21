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
   console.log(body);
    async.parallel([
      function(call){
        (function iterator(i){
          if(i >= body.names.length){
            call(null,'Deleted');
            return;
          } 
          fs.remove(custom_paths.public_images_folder+body.names[i], function(err){
            if(err){
              call({error:err, message:'Cant delete from file system.'});
              return;
            }

              iterator(i+1);
         });
        })(0);
      },function(call){
      /*********************** DELETING RECORS FROM DATABASE ************************ */
        GalleryModel.remove({_id:{$in:body.names_id}},function(err){
          if(err){
            call({error:err, message:'Cant delete gallerys from database.'});
            return;
          }
          
          call(null,'Successfully deleted from database');
        });
      }
    ],function(err,call){
      if(err){
        res.json({error:err, message:'cant delete galerys'});
        return;
      }
      res.json({message:"Galerys deleted.", data:call});
    });
  });

module.exports = router;