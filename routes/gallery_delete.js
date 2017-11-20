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
   var log_file = [];
        (function iterator(i){
          if(i >= body.length){
            res.json({logfile:log_file})
            return;
          } 
          console.log('times repeat - ' + i)
          async.waterfall([
            // finds gallerys - route name, and _id, by given _id;
            function(call){
              GalleryModel.findOne({_id:body[i]},{ folder_name:1,group_name:1 },
                                               function(err,data){
                                                 if(err){call(err);return;}
                                                 console.log('data from database.')
                                                 console.log(data)
                                                 call(null,data);
                                                });
                                                // removes folder from fyle sysytem by given route_name;
              },function(data,call){
                console.log('data from callback .')
                console.log(data)
              fs.remove(custom_paths.public_folder+'/'+data.group_name+'/'+data.folder_name, function(err){
                if(err){ call(err); return; }
                call(null,data._id);
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
            log_file.push(call)
            iterator(i+1)
          });
        })(0);
  });

module.exports = router;