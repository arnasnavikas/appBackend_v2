var express = require ('express');
var router = express.Router();
var async = require ('async');
var categoryModel = require('../mongoDB/group-model');
var GalleryModel = require('../mongoDB/gallery_schema');
var fs = require('fs-extra');
var customPath = require('./paths');

router.put('/:id/:folder/:newName',function(req,res,next){
    var group_id = req.params.id;
    var folder = req.params.folder;
    var newName = req.params.newName;
    var routeName = newName.replace(/ /g,"-");
    async.parallel([
        function(call){
            categoryModel.update({_id:group_id},
                                 {pavadinimas: newName,route:routeName},
                                 function(err,data){
                                     if(err){call(err);return;}
                                     call(null,data);
                                 });
        },function(call){
            fs.rename(customPath.public_folder+folder,
                      customPath.public_folder+routeName,function(err,data){
                          if(err){call(err);return;}
                          call(null,data);
                      });
        },function(call){
               GalleryModel.findOne({group_id:group_id},function(err,data){
                if(err){call(err); return;}
                var pictures = data.gallery_images;
                var new_index_img;
                var new_route = customPath.images_location+routeName+'/'+data.route_name+'/';
                if(data.index_img){
                    var indexImgName = data.index_img.slice(-17);
                    new_index_img = new_route+indexImgName;
                }
                if(pictures.length > 0 ){
                    for(var i=0; i < pictures.length; i++){
                        var pictureName = pictures[i].img_src.slice(-17);
                        pictures[i].img_src = new_route+pictureName;
                    }
                    GalleryModel.update({group_id:group_id},
                                    {$set:{ gallery_images : pictures, 
                                            index_img      : new_index_img}},
                                    function(err,renamed){ 
                                        if(err){call(err);return;}
                                        call(null,renamed);
                                    });
                }else{
                    GalleryModel.update({group_id:group_id},
                                    {$set:{group_name: routeName,
                                           index_img : new_index_img }},
                                    function(err,renamed){
                                        if(err){ call(err);return;}
                                        call(null,renamed);
                                    });
                }
            });
        }
    ],function(err,call){
        if(err){res.json(err);return;}
        res.json(call);
    });
});
 module.exports = router;