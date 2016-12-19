var express = require ('express');
var router = express.Router();
var custom_paths = require('./paths');
var fs = require('fs-extra');
var async = require('async');
var GalleryModel = require('../mongoDB/gallery_schema');

router.post('/',function(req,res,next){
var body = JSON.parse(req.body.data);
console.log(body);
async.waterfall([
    /***************************** SEARCH FOR index.JPG IN DATABASE  ************************** */
    function(call){
        GalleryModel.find({_id:body.gallery_id, gallery_images:{$elemMatch:{img_name:'index.JPG'}}},function(err,data){
            if(err){
                call(err);
                return;
            }
            console.log(data);
            call(null,data);
        });
    /***************************** UPDATE index.JPG IMAGE IN DATABASE  ************************** */
    },function(index,call){
        var new_name = Date.now()+'.JPG';
        /** ******** IF index.JPG DONT EXIST CREATE NEW********* */
        if(index.length == 0){
            console.log('index not found');
            GalleryModel.update({_id: body.gallery_id, "gallery_images._id":body.index_id},
                                {$set:{"gallery_images.$.img_name":"index.JPG",
                                       "gallery_images.$.img_dest":custom_paths.public_images_folder+body.folder+'/'+'index.JPG',
                                       "gallery_images.$.img_src": custom_paths.images_location+body.folder+'/'+'index.JPG'
                                }},function(err,data){
                                    if(err){
                                        call({error:err, mesage:'cant update new index.jpg'});
                                        return;
                                    }
                                    console.log(data);
                                    call(null, true, null);
                                });
        /** ******** IF index.JPG EXIST, UPDATE OLD index.JPG TO DEFAULT PICTURE ********* */
        }else{
            console.log('index found with _id: '+ body.index_id);
            GalleryModel.update({_id: body.gallery_id, "gallery_images._id":body.index_id},
                                {$set:{"gallery_images.$.img_name": new_name,
                                       "gallery_images.$.img_dest":custom_paths.public_images_folder+body.folder+'/'+new_name,
                                       "gallery_images.$.img_src": custom_paths.images_location+body.folder+'/'+new_name
                                }},function(err,data){
                                    if(err){
                                        call({error:err, mesage:'cant update existing index.jpg'});
                                        return;
                                    }
                                    console.log(data);
                                    call(null, false, new_name);
                                });

                }
    /***************************** READ GALLERY DIRECTORY FOR FILES   ************************** */
    },function(status,name,call){
        if(status){
            console.log('writing new instance of index.jpg');
            fs.rename(custom_paths.public_images_folder+body.folder+'/'+body.index, 
                  custom_paths.public_images_folder+body.folder+'/index.JPG', function(err){
                      if(err){
                        call({error: err, mesage: 'cant add new index.'});
                        return;
                      } 
                      call(null, false);
                  });
        }else{
            console.log('replacing old index.jpg to new with name: '+name);
            console.log(custom_paths.public_images_folder+body.folder+'/index.JPG');
            fs.rename(custom_paths.public_images_folder+body.folder+'/index.JPG', 
                  custom_paths.public_images_folder+body.folder+'/'+name, function(err){
                      if(err){
                        call({error: err, mesage: 'cant add index.'});
                        return;
                      } 
                      call(null, true);
                  });
        }
    },function(status,call){
        if(status){
            fs.rename(custom_paths.public_images_folder+body.folder+'/'+body.index, 
                  custom_paths.public_images_folder+body.folder+'/index.JPG', function(err){
                      if(err){
                        call({error: err, mesage: 'cant replace old index.'});
                        return;
                      } 
                      call(null, null);
                  });
        }else{
            call(null,null);
        }
    }
],function(err,call){
    if(err){
            console.log('************** 10 ************');
        res.json({error: err});
        return;
    }
    console.log('this is error from end function: '+err);
    console.log('data from last function: '+call);
res.json({mesage: call});
});


});

module.exports = router;