var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var async = require('async');
var custom_paths = require('./paths');
var GalleryModel = require('../mongoDB/gallery_schema');
var PictureModel = require('../mongoDB/picture-schema');
var groupModel = require('../mongoDB/group-model')

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
}).get('/user-id/:user_id', function(req, res, next) {
    /*##############################################################
     LOAD GALLERY BY USER ID 
     ###############################################################*/
     GalleryModel.find({user_id:req.params.user_id},function(err,data){
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
         *    folder_name  : 'asdasd',
         *    user_folder  : 'asdasd',
         *  }
         */
        var body = JSON.parse(req.body.data);
            async.parallel([
              /*********************** CREATE NEW FOLDER IN FYLE SYSTEM *********************** */
                function(call){
                    fs.mkdir(custom_paths.public_folder+'/'+body.user_folder+'/'+body.group_folder+'/'+body.folder_name, function(err) {
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
            },function(call){
                /*********************** UPDATES GALLERY NUMBER IN GROUP MODEL ******************** */
                groupModel.findOneAndUpdate({_id:body.group_id},{$inc:{"gallerys":1}},function(err,data){
                    if(err){ call(err); return; }
                    call(null,data);
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
             res.json(log_file)
             return;
           } 
           async.waterfall([
             function(call){
        /************************** FINDS GALLERY *************************** */
               GalleryModel.findOne({_id:body[i]}, function(err,gallery){
                                                  if(err){call(err);return;}
                                                  call(null,gallery);
                                                 });
        /************************** REMOVE GALLERY FROM FYLE SYSTEM ********* */
               },function(gallery,call){
                var gallery_folder = custom_paths.public_folder+'/'+gallery.user_folder+'/'+gallery.group_folder+'/'+gallery.folder_name;
                fs.stat(gallery_folder, (err,stat) => {
                    if(stat){
                        fs.remove(gallery_folder, function(err){
                          if(err){ call(err); return; }
                          log_file.push('Folder deleted successfuly.')
                          call(null,gallery);
                        });
                    }else{
                        res.status(500).send('no path with name - '+pic_path);
                        return;
                    }
                  });
        /************************** REMOVE GALLERY FROM DATA BASE ********* */
             },function(gallery,call){
               GalleryModel.remove({_id:body[i] },function(err,data){
                 if(err){ call(err); return; }
                 log_file.push(data);
                 call(null,gallery);
               });
             },function(gallery,call){
        /************************** REMOVER PICTUREs FROM DATABASE ********* */
                PictureModel.remove({gallery_id:gallery._id},function(err,data){
                 if(err){ call(err); return; }
                 log_file.push(data);
                 call(null,gallery);
                })
             },function(gallery,call){
        /************************** UPDATES GROUP MOGEL "GALLERYS" NUMBER ********* */
                groupModel.update({_id:gallery.group_id},{$inc:{'gallerys':-1}},function(err,data){
                    if(err){ call(err); return; }
                    log_file.push(data);
                    call(null,data);
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
            {$set:{ name : data.name,
                    route : data.routeName}},function(err,data){
                        if(err){ call(err);return;}
                        res.json(data)
                });
     });

 module.exports = router;
 