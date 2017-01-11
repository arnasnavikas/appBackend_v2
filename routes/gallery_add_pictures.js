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
router.post('/:folder', upload.any(),  (req,res,next)=>{

    var files = req.files;
    if(files){
        // console.log(files);
        var folder = req.params.folder;

        async.waterfall([
                /*********************** WRITES PICTURE FILE DO HARD DISK ***************** */
            function(call){
                var pic_path = custom_paths.public_images_folder+folder+'/';
                var pic_name = Date.now()+'.JPG';
                var bufferStream = new stream.PassThrough();
                bufferStream.end(new Buffer(files[0].buffer));
                var writeFile = fs.createWriteStream(pic_path+pic_name);
                var pipe = bufferStream.pipe(writeFile);
                writeFile.on('close', function () { 
                    console.log('finished');
                    call(null, pic_name);
                });
                /*********************** ADD PICTURE TO DATABASE ***************** */
            },function(result, call){
                var img_obj ={  img_name: result,
                                img_src: custom_paths.images_location+folder+'/'+result,
                                size: files[0].size
                             };
                GalleryModel.update({route_name:folder},{$push:{gallery_images:img_obj}},function(err,data){
                    if(err){
                        call({error:err, message:'Cant push image object in database'});
                        return;
                    }
                    call(null,{message:"image pushed to database."});
                });
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
/*##########################################################
* Loads image description
############################################################ */
}).get('/:galleryId/:pictureId',function(req,res,next){
    var gallery_id = req.params['galleryId'];
    var picture_id = req.params['pictureId'];

  GalleryModel.find({_id: gallery_id},{gallery_images:{$elemMatch:{_id:picture_id}}},function(err,data){
      if(err){
          res.json({error:err, message:'Cant find description'});
          return;
      }

    res.json({message: 'working', id:{id1: gallery_id, id2:picture_id}, data:data[0].gallery_images[0].description});
  });
/*##########################################################
* Updates image description
############################################################ */
}).put('/',function(req,res,next){
  var _body = JSON.parse(req.body.data);
  GalleryModel.update({_id:_body.gallery_id ,"gallery_images._id":_body.image_id},{$set:{"gallery_images.$.description": _body.description}},function(err,data){
                                        if(err){
                                            res.json({error:err, message: 'Cant update descrition'});
                                            return;
                                        }
                                            res.json({message:'Description updated.', data:data});
                                    });
});
  module.exports = router;