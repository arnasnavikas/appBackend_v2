var express         = require ('express');
var multer          = require ('multer');
var fs              = require ('fs-extra');
var stream          = require ('stream');
var router          = express.Router();
var custom_paths    = require ('./paths');
var async           = require ('async');
var GalleryModel    = require ('../mongoDB/gallery_schema');

var upload = multer({
    inMemory: true
});

/*##########################################################
saving images to folder
############################################################ */
router.post('/:folder/:sub/:id', upload.any(),  (req,res,next)=>{
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
/*##########################################################
* Updates image description
############################################################ */
}).put('/',function(req,res,next){
  var _body = JSON.parse(req.body.data);
  GalleryModel.update({_id:_body.gallery_id,
                       "gallery_images._id":_body.image_id},
                       {$set:{"gallery_images.$.description": _body.description}}
                          ,function(err,data){
                            if(err){ res.json(err);return;}
                            res.json(data);
                          });
});
  module.exports = router;