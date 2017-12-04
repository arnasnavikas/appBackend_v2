var express         = require ('express');
var multer          = require ('multer');
var fs              = require ('fs-extra');
var stream          = require ('stream');
var router          = express.Router();
var custom_paths    = require ('./paths');
var async           = require ('async');
var PictureModel = require('../mongoDB/picture-schema');

var upload = multer({
    inMemory: true
});

/*##########################################################
saving images to folder
############################################################ */
router.post('/:user_folder/:user_id', upload.any(),  (req,res,next)=>{
    var files = req.files;
    var user_folder =  req.params.user_folder;
    var user_id = req.params.user_id;
    if(files){
        async.waterfall([
                /*********************** WRITES PICTURE FILE DO HARD DISK ***************** */
            function(call){
                var pic_path = custom_paths.public_folder+'/'+user_folder+'/private_pictures/';
                var pic_name = Date.now()+'.JPG';
                var bufferStream = new stream.PassThrough();
                bufferStream.end(new Buffer(files[0].buffer));
                fs.stat(pic_path, (err,stat) => {
                    if(err){
                        fs.mkdir(pic_path,function(err,data){
                            if(err){ call(err); return;}
                            var writeFile = fs.createWriteStream(pic_path+pic_name);
                            var pipe = bufferStream.pipe(writeFile);
                            writeFile.on('close', function () { 
                                call(null, pic_name);
                            });   
                        });
                    }else{
                        var writeFile = fs.createWriteStream(pic_path+pic_name);
                        var pipe = bufferStream.pipe(writeFile);
                        writeFile.on('close', function () { 
                            call(null, pic_name);
                        });
                    }
                  });
                /*********************** ADD PICTURE TO DATABASE ***************** */
            },function(name, call){
                var img_obj ={  name: name,
                                user_id : user_id,
                                user_folder: user_folder,
                                imgURL: custom_paths.images_location+user_folder+'/private_pictures/'+name,
                                size: files[0].size,
                                private: true
                             };
               new PictureModel(img_obj).save(function(err,data){
                    if(err){call(err);return;}
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
.get('/:user_id',function(req,res,next){
    var user = req.params.user_id;
    PictureModel.find({user_id:user,private:true},function(err,data){
        if(err){res.json(err);return;}
        res.json(data);
    });
})
/*##########################################################
 deletes selected pictures
############################################################ */
.put('/',function(req,res,next){
    var imageList = JSON.parse(req.body.data);
    var log_file = [];
    (function repeat(i){
        if(i >= imageList.length){
            res.json({response:log_file});
            return;
        }
        async.waterfall([
            function(call){
                PictureModel.findOneAndRemove({_id:imageList[i]},function(err,data){
                    if(err){call(err);return;}
                    log_file.push(data);
                    call(null,data)
                });
            },function(picture,call){
                var pic_path = custom_paths.public_folder+'/'+picture.user_folder+'/private_pictures/'+picture.name;
                fs.stat(pic_path, (err,stat) => {
                    if(stat){
                         fs.remove(pic_path,function(err,data){
                            if(err){call(err);return;}
                            log_file.push(data)
                            call(null,data);
                        });
                    }else{
                        res.status(500).send('no path with name - '+pic_path);
                        return;
                    }
                  });
               
            }
        ],function(err,call){
            if(err){res.json(err);return;}
            repeat(i+1);
        })
    })(0);
});
module.exports = router;