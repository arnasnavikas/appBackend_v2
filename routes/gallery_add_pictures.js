var express = require('express');
var multer = require('multer');
var fs = require('fs-extra');
var stream = require('stream');
var router = express.Router();
var custom_paths = require('./paths');
var async = require('async');
var GalleryModel = require('../mongoDB/gallery_schema');

var upload = multer({
    inMemory: true
});

/*##########################################################
saving images to folder
############################################################ */
router.post('/:folder', upload.any(),  (req,res,next)=>{

    var files = req.files;
    if(files){
        // console.log(files);
        var folder = req.params.folder;

        async.waterfall([
                /*********************** WRITES PICTURE FILE DO HARD DISK ***************** */
            function(call){
                var pic_path = custom_paths.public_images_folder+folder+'/';
                var pic_name = Date.now();
                var bufferStream = new stream.PassThrough();
                bufferStream.end(new Buffer(files[0].buffer));
                var writeFile = fs.createWriteStream(pic_path+pic_name+'.JPG');
                var pipe = bufferStream.pipe(writeFile);
                writeFile.on('close', function () { 
                    console.log('finished');
                    call(null, { destination : pic_path, img_name : pic_name} );
                });
                /*********************** CREATES DESCRIPTION FILE FOR PICTURE ***************** */
            },function(_path, call){
                /*********************** CHECKS IF GALLERY EXISTS IN DATABASE ***************** */
                GalleryModel.find({gallery_name:folder},function(err,result){
                    if(err)
                    call(err);

                call(null,result,_path);
                });
                /*********************** WRITE PICTURE INFO TO DATABASE ***************** */
            },function(result, _path, call){
                var img_obj ={ img_name: _path.img_name+'.JPG',
                            img_src: custom_paths.images_location+folder+'/'+_path.img_name+'.JPG',
                            img_dest: custom_paths.public_images_folder+folder+'/'+_path.img_name+'.JPG',
                            size: files[0].size
                            };
                if(result.length == 0){
                    var gallery = new GalleryModel({
                            gallery_name: folder,
                            gallery_images: [img_obj]
                            });

                    gallery.save(function(err){
                        if(err)
                            call(err);
                        call(null,null);
                    });
                }else{
                GalleryModel.update({gallery_name: folder},{$push :{gallery_images: img_obj} },function(err,status){
                    if(err)
                        call(err);

                    call(null,null)
                });
                }

            }
        ],function(err,data){
            if(err){
                res.json({error: err});
                return;
            }
                res.json({file: files[0].originalname, message:data });
        });
    }else
        res.json({message: 'no files detected'});
    
});
  module.exports = router;