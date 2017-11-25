var express = require('express');
var router = express.Router();
var fs = require ('fs-extra');
var async = require ('async');
var custom_paths = require('./paths');
var GalleryModel = require('../mongoDB/gallery_schema');
var multer          = require ('multer');
var stream          = require ('stream');
var PictureModel = require('../mongoDB/picture-schema');

var upload = multer({
    inMemory: true
});

router.get('/get-pictures/:gallery_id',function(req,res,next){
/*##########################################################
GET GALLERY IMAGES GALLERY ()
############################################################ */
var gallery_id = req.params.gallery_id;
    PictureModel.find({gallery_id:gallery_id},function(err,data){
        if(err){ res.json(err);return;}
        res.json(data)
    });
}).post('/upload/:folder/:sub/:id', upload.any(),  (req,res,next)=>{
/*##########################################################
ADD IMAGES TO GALLERY (working)
############################################################ */
        var files = req.files;
        if(files){
            var group_folder = req.params.folder;
            var gallery_folder = req.params.sub;
            var gallery_id = req.params.id;
            async.waterfall([
                    /*********************** WRITES PICTURE FILE DO HARD DISK ***************** */
                function(call){
                    var pic_path = custom_paths.public_folder+'/'+group_folder+'/'+gallery_folder+'/';
                    var pic_name = Date.now()+'.JPG';
                    var bufferStream = new stream.PassThrough();
                    bufferStream.end(new Buffer(files[0].buffer));
                    fs.exists(pic_path, (exists) => {
                        if(exists){
                            var writeFile = fs.createWriteStream(pic_path+pic_name);
                            var pipe = bufferStream.pipe(writeFile);
                            writeFile.on('close', function () { 
                                call(null, pic_name);
                            });
                        }else{
                            res.status(500).send('no path with name - '+pic_path);
                            return;
                        }
                      });
                    /*********************** ADD PICTURE TO DATABASE ***************** */
                },function(image_name, call){
                    var image;
                    GalleryModel.findOne({_id:gallery_id},function(err,data){
                        if(err){ call(err);return; }
                        image ={  name: image_name,
                                  imgURL: custom_paths.images_location+group_folder+'/'+gallery_folder+'/'+image_name,
                                  size: files[0].size,
                                  group_id: data.group_id,  
                                  gallery_id: data._id,
                                  folder_name: gallery_folder,
                                  gallery_name : data.name,
                                  group_folder : data.group_folder
                            };
                        var newPicture = new PictureModel(image);
                        newPicture.save(function(err,picture){
                            if(err){ call(err);return; }
                            call(null,data)
                        })
                    });
                },function(data,call){
                    /*********************** UDATES GALLERY IMAGE NUMBER ***************** */
                    var picture_in_gallery = data.gallery_images + 1;
                    console.log(data)

                        GalleryModel.update({_id:data._id},{gallery_images:picture_in_gallery},function(err,data){
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
}).put('/delete', function(req,res,next){
/*##############################################################
 Delete pictures from folder 
 ###############################################################*/
  var body = JSON.parse(req.body.data);
//   var gallery_id = req.params.gallery_id;
        (function iterator(i){
          if(i >= body.length){
            res.json({message: 'Pictures deleted successfuly.',data:body})
            return;
          } 
          async.waterfall([
            function(call){
     /*********************** FIND PICTURE  ***************** */
              PictureModel.findOne({_id:body[i]},function(err,image){
                if(err){call(err);return;}
                call(null,image);
              })
            }
     /*********************** REMOVE FROM FYLE SYSTEM  ***************** */
            ,function(image,call){
                    var image_path = custom_paths.public_folder+'/'+image.group_folder+'/'+image.folder_name+'/'+image.name;
                    fs.stat(image_path, (err,stat) => {
                        if(stat){
                            fs.remove(image_path, function(err){
                                if(err){ call(err); return; }
                                call(null,image);
                            });
                        }else{
                            res.status(500).json(err)
                            return;
                        }
                });
     /*********************** UPDATE GALLERY IMAGES NUMBER  ***************** */
    },function(image,call){
        console.log('group_id - '+image.group_id)
        GalleryModel.findOne({_id:image.gallery_id},function(err,gallery){
            if(err){ call(err); return; }
            var picture_in_gallery = gallery.gallery_images - 1;
            GalleryModel.update({_id:image.gallery_id},{gallery_images:picture_in_gallery},
                function(err,data){
                    if(err){ call(err); return; }
                    call(null,data);
                });
            });
        },function(data,call){
     /*********************** DELETE IMAGE FROM DATABASE  ***************** */
                PictureModel.remove({_id:body[i]},function(err){
                    if(err){ call(err);return;}
                    call(null,data)                    
                });
            }
          ],function(err,call){
            if(err){ res.json(err); return }
            iterator(i+1)
          });
        })(0);
  }).put('/add-description',function(req,res,next){
/*##########################################################
* Updates image description
############################################################ */
    var body = JSON.parse(req.body.data);
    PictureModel.update({_id:body.id},{description:body.description}
                            ,function(err,data){
                              if(err){ res.json(err);return;}
                              res.json(data);
                            });
  });
  

module.exports = router;