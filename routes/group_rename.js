var express = require ('express');
var router = express.Router();
var async = require ('async');
var categoryModel = require('../mongoDB/group-model');
var GalleryModel = require('../mongoDB/gallery_schema');
var fs = require('fs-extra');
var customPath = require('./paths');

router.put('/:id/:folder',function(req,res,next){
    var group_id = req.params.id; //group id
    var folder = req.params.folder; // group folder name
    var body = JSON.parse(req.body.data); // {pavadinimas:'',route:'',imgURL:'',aprasymas:''}
    console.log(body);
    async.parallel([
        /** updates group name in database */
        function(call){
            categoryModel.update({_id:group_id},
                                 {pavadinimas: body.pavadinimas,
                                  route:body.route,
                                  imgURL: body.imgURL,
                                  aprasymas: body.aprasymas
                                },
                                 function(err,category){
                                     if(err){call(err);return;}
                                     call(null,category);
                                 });
        /** updates group name in fyle system */
        },function(call){
            fs.rename(customPath.public_folder+folder,
                      customPath.public_folder+body.route,function(err){
                          if(err){call(err);return;}
                          call(null,'renamed in fyle system');
                      });
        /** update all gallerys pictures source location in database */
        },function(call){
               GalleryModel.find({group_id:group_id},function(err,gallery){
                if(err){call(err); return;}
                var length = gallery.length;
                if( length > 0){
                    (function repeat(i){
                        if(i >= length){
                            call(null,gallery);
                            return;
                        }
                    var pictures = gallery[i].gallery_images;
                    var picturesLength = pictures.length;
                    var new_index_img = '';
                    var new_route = customPath.images_location+body.route+'/'+gallery[i].route_name+'/';
                    if(gallery[i].index_img){
                        var indexImgName = gallery[i].index_img.slice(-17);
                        new_index_img = new_route+indexImgName;
                    }
                    // if gallery have pictures, change picture source to new 
                    if(picturesLength > 0){
                        for(var i=0; i < picturesLength; i++){
                            var pictureName = pictures[i].img_src.slice(-17);
                            pictures[i].img_src = new_route+pictureName;
                        }
                        GalleryModel.update({group_id:group_id},
                                        {$set:{ gallery_images:pictures, 
                                                index_img:new_index_img,
                                                group_name:body.route,}},
                                        function(err,renamed){ 
                                            if(err){call(err);return;}
                                            repeat(i+1);
                                        });
                    // if gallery have no pictures, change only group name  
                    }else{
                        GalleryModel.update({group_id:group_id},
                                        {$set:{group_name:body.route }},
                                        function(err,renamed){
                                            if(err){ call(err);return;}
                                            repeat(i+1);
                                        });
                    }
                    })(0);
                }else
                call(null,null);
            });
        }
    ],function(err,call){
        if(err){res.json(err);return;}
        res.json(call);
    });
});
 module.exports = router;