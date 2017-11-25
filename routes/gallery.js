var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var async = require('async');
var custom_paths = require('./paths');
var GalleryModel = require('../mongoDB/gallery_schema');
var stream          = require ('stream');
var multer          = require ('multer');
var upload = multer({
    inMemory: true
});


/*##############################################################
 LOAD ALL GALLERYS BY GROUP ID (working)
 ###############################################################*/
 router.get('/:group_id', function(req, res, next){
     GalleryModel.find({group_id:req.params.group_id},function(err,data){
         if(err){ res.json(err); return; }
         res.json(data);
        });
}).get('/gallery-name/:route', function(req, res, next) {
/*##############################################################
 LOAD GALLERY BY ROUTE NAME
 ###############################################################*/
 GalleryModel.findOne({route:req.params.route},function(err,data){
     if(err){ res.json(err); return; }
     res.json(data);
    });
}).get('/pictures/:gallery_id',function(req,res,next){
 /*##############################################################
 LOAD ONE GALLERY BY GALLERY ID
 ###############################################################*/
 GalleryModel.findOne({_id:req.params.gallery_id},function(err,data){
     if(err){ res.json(err); return; }
     res.json(data);
    });
 }).post('/create', function(req,res,next){
 /*##############################################################
 CREATE NEW GALLERY (working)
 ###############################################################*/
        // data structure
        /** { name : 'data',
         *    description    : 'data',
         *    route   : 'nasm_sad_',
         *    group_folder   : 'asd-asd',
         *    group_id     : 'asd-asd',
         *    folder_name  : 'asdasd'
         *  }
         */
        var body = JSON.parse(req.body.data);
            async.parallel([
              /*********************** CREATE NEW FOLDER *********************** */
                function(call){
                    fs.mkdir(custom_paths.public_folder+'/'+body.group_folder+'/'+body.folder_name, function(err) {
                                        if (err){
                                            if(err.code === 'EEXIST'){
                                                call(err);
                                                return;
                                            }else 
                                                call(err);
                                                return;
                                        }
                                        call(null, 'folder created');
                                    });
              /*********************** CREATE NEW GALLERY DOCUMENT IN DATABASE ******************** */
            },function(call){
                var new_gallery = new GalleryModel(body);
                new_gallery.save(function(err,data){
                    if(err){ call(err); return; }
                    call(null, data);
                });
            }],function(err,call){
                if(err){res.json(err); return;}
                res.json(call);    
            });
         
}).post('/delete', function(req,res,next){
 /*##############################################################
  DELETES GALLERYS (working)
  ###############################################################*/
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
               GalleryModel.findOne({_id:body[i]},{ folder_name:1,group_folder:1 },
                                                function(err,data){
                                                  if(err){call(err);return;}
                                                  console.log('data from database.')
                                                  console.log(data)
                                                  call(null,data);
                                                 });
                                                 // removes folder from fyle sysytem by given route;
               },function(data,call){
                 console.log('data from callback .')
                 console.log(data)
               fs.remove(custom_paths.public_folder+'/'+data.group_folder+'/'+data.folder_name, function(err){
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
}).post('/description/:id',function(req,res,next){
/*##############################################################
    UPDATE GALLERY DESCRITION (working)
 ###############################################################*/
         var id = req.params.id
         var data = JSON.parse(req.body.data)
         GalleryModel.update({_id:id},
             {$set:{ description: data.description}},
                 function(err,data){
                     if(err){ call(err);return;}
                     res.json(data)
                 });
}).put('/rename', function(req,res,next){
 /*##############################################################
  UPDATE GALLERY NAME
 ###############################################################*/
        var data =JSON.parse(req.body.data)
        GalleryModel.update({_id:data.id},
            {$set:{ name   : data.name,
                route     : data.routeName}},
                function(err,data){
                    if(err){ call(err);return;}
                    res.json(data)
                });
     });

 module.exports = router;
 