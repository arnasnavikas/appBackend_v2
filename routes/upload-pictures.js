var express         = require ('express');
var multer          = require ('multer');
var fs              = require ('fs-extra');
var stream          = require ('stream');
var router          = express.Router();
var custom_paths    = require ('./paths');
var async           = require ('async');
var imagesModel     = require ('../mongoDB/images-model');
var upload = multer({
    inMemory: true
});

/*##########################################################
saving images to folder
############################################################ */
router.post('/', upload.any(),  (req,res,next)=>{
    var files = req.files;
    if(files){
        console.log(files);
        async.waterfall([
                /*********************** WRITES PICTURE FILE DO HARD DISK ***************** */
            function(call){
                var pic_path = custom_paths.private_images_folder;
                var pic_name = Date.now()+'.JPG';
                var bufferStream = new stream.PassThrough();
                bufferStream.end(new Buffer(files[0].buffer));
                var writeFile = fs.createWriteStream(pic_path+pic_name);
                var pipe = bufferStream.pipe(writeFile);
                writeFile.on('close', function () { 
                    console.log('finished');
                    console.log('picture writed');
                    call(null, pic_name);
                });
                /*********************** ADD PICTURE TO DATABASE ***************** */
            },function(name, call){
                var img_obj ={  name: name,
                                imgURL: custom_paths.private_images_location+name,
                                size: files[0].size
                             };
                var newPicture = new imagesModel(img_obj);
                newPicture.save(function(err,data){
                    if(err){console.log(err); call(err);return;}
                    console.log(data);
                    call(null,data);
                });
            }
        ],function(err,data){
            if(err){ res.end(); return; }
            res.end();
        });
    }else
        res.json({message: 'no files detected'});
})
/*##########################################################
 finds all pictures
############################################################ */
.get('/',function(req,res,next){
    imagesModel.find(function(err,data){
        if(err){res.json(err);return;}
        res.json(data);
    });
})
/*##########################################################
 deletes selected pictures
############################################################ */
.put('/',function(req,res,next){
    var imageList = JSON.parse(req.body.data);
    (function repeat(i){
        if(i >= imageList.length){
            res.json({images: i});
            return;
        }
        async.waterfall([
            function(call){
                imagesModel.findOne({_id:imageList[i]},function(err,data){
                    if(err){call(err);return;}
                    imagesModel.remove({_id:imageList[i]},function(_err,_data){
                        if(_err){call(_err);return;}
                        call(null,data.name);
                    });
                });
            },function(name,call){
                fs.remove(custom_paths.private_images_folder+name,function(err,data){
                    if(err){call(err);return;}
                    call(null,null);
                });
            }
        ],function(err,call){
            if(err){res.json(err);return;}
            repeat(i+1);
        })
    })(0);
});
module.exports = router;