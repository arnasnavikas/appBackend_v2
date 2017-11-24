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
 GalleryModel.findOne({route_name:req.params.route},function(err,data){
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
        /** { gallery_name : 'data',
         *    aprasymas    : 'data',
         *    route_name   : 'nasm_sad_',
         *    group_name   : 'asd-asd',
         *    group_id     : 'asd-asd',
         *    folder_name  : 'asdasd'
         *  }
         */
        var body = JSON.parse(req.body.data);
            async.parallel([
              /*********************** CREATE NEW FOLDER *********************** */
                function(call){
                    fs.mkdir(custom_paths.public_folder+'/'+body.group_name+'/'+body.folder_name, function(err) {
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
         
}).post('/:folder/:sub/:id', upload.any(),  (req,res,next)=>{
/*##########################################################
ADD IMAGES TO GALLERY (working)
############################################################ */
    var files = req.files;
    if(files){
        var folder = req.params.folder;
        var subFolder = req.params.sub;
        var folder_id = req.params.id;
        async.waterfall([
                /*********************** WRITES PICTURE FILE DO HARD DISK ***************** */
            function(call){
                var pic_path = custom_paths.public_folder+'/'+folder+'/'+subFolder+'/';
                var pic_name = Date.now()+'.JPG';
                var bufferStream = new stream.PassThrough();
                bufferStream.end(new Buffer(files[0].buffer));
                var writeFile = fs.createWriteStream(pic_path+pic_name);
                var pipe = bufferStream.pipe(writeFile);
                writeFile.on('close', function () { 
                    call(null, pic_name);
                });
                /*********************** ADD PICTURE TO DATABASE ***************** */
            },function(result, call){
                var img_obj ={  name: result,
                                imgURL: custom_paths.images_location+folder+'/'+subFolder+'/'+result,
                                size: files[0].size
                             };
                GalleryModel.update({_id:folder_id},{$push:{gallery_images:img_obj}},function(err,data){
                    if(err){ call(err);return; }
                    call(null,{message:"image pushed to database."});
                });
            }
        ],function(err,data){
            if(err){ res.json({error: err}); return; }
            res.json({file: files[0].originalname, message:data });
        });
    }else
        res.json({message: 'no files detected'});
}).put('/:group/:folder/:groupId', function(req,res,next){
 /*##############################################################
  DELETES IMAGES FROM GALLERY
 ###############################################################*/
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
}).post('/description/:id',function(req,res,next){
/*##############################################################
    UPDATE GALLERY DESCRITION (working)
 ###############################################################*/
         var id = req.params.id
         var data = JSON.parse(req.body.data)
         GalleryModel.update({_id:id},
             {$set:{ aprasymas: data.description}},
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
            {$set:{ gallery_name   : data.name,
                route_name     : data.routeName}},
                function(err,data){
                    if(err){ call(err);return;}
                    res.json(data)
                });
     });

 module.exports = router;
 