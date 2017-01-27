var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var async = require('async');
var custom_paths = require('./paths');
var GalleryModel = require('../mongoDB/gallery_schema');

/*##############################################################
    Create new gallery folder 
 ###############################################################*/
router.post('/:name', function(req,res,next){
// data structure
/** { "pavadinimas" : "data",
 *    "aprasymas" : "data",
 *    "route_name" : 'nasm_sad_'
 *  }
 */
      /******************* CHECK IF PARAMETER FROM REQUEST BODY ARE VALID ************** */
if(req.params.name != undefined){
    var _body = JSON.parse(req.body.data);
    async.waterfall([
      /*********************** CREATE NEW FOLDER *********************** */
        function(call){
            fs.mkdir(custom_paths.public_images_folder+_body.route_name, function(err) {
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
        },function(empty,call){
            var new_gallery = new GalleryModel(_body);
                new_gallery.save(function(err,data){
                    if(err){
                        call(err);
                        return;
                    }
                    call(null, data);
                });
        }
    ],function(err,call){
        if(err){
            res.json({error:err});
            return;
        }
        else
            res.json({message:"Gallery successfully created.", data:call});    
    });
 }else{
     res.json({message:'bad params.'});
 }
/*##############################################################
    UPDATE GALLERY NAME
 ###############################################################*/
}).put('/:name', function(req,res,next){
    if(req.params.name){
    var body = JSON.parse(req.body.data);
    var oldName = req.params.name;
    var message ={ fyleSYS: undefined,
                   database: undefined
                 };
/*********************** ADD/UPDATE DESCRIPTION ************************ */
    if(body.route_name == oldName){
            GalleryModel.update({_id: body.id},{aprasymas:body.aprasymas},function(err,data){
                if(err){
                    res.json({message:'Record was not updated.', error: err});
                    return;
                }
                message.database = 'description updated';
                res.json({message: message , data:data});
            });
            return;
        }else{
            async.waterfall([
/*********************** RENAME GALLERY IN FILE SYSTEM ************************ */
            function(call){
                fs.rename(custom_paths.public_images_folder+oldName, 
                        custom_paths.public_images_folder+body.route_name, function(err){
                            if(err){ call({error: err, message: 'cant rename in folder in fyle system'});
                                return;
                            } 
                            message.fyleSYS = 'Reanamed in file system.';
                            call(null,message)
                        });
/*********************** RENAME GALLERY IN DATABASE ************************ */
            },function(messages,call){
            GalleryModel.findOne({_id:body.id},function(err,data){
                if(err){
                    call({error:err, message: 'cant find gallery'});
                    return;
                }
                var pictures = data.gallery_images;
                if(pictures.length > 0 ){
                    var new_route = custom_paths.images_location+body.route_name+'/';
                    var new_index_img;
                    if(data.index_img){
                        var indexImgName = data.index_img.slice(-17);
                        new_index_img = new_route+indexImgName;
                    }
                    for(var i=0; i < pictures.length; i++){
                        var pictureName = pictures[i].img_src.slice(-17);
                        pictures[i].img_src = new_route+pictureName;
                    }
                    GalleryModel.update({_id:body.id},
                                    {$set:{ gallery_images : pictures, 
                                            gallery_name   : body.gallery_name,
                                            route_name     : body.route_name,
                                            aprasymas      : body.aprasymas,
                                            index_img      : new_index_img}},
                                    function(err,data){ if(err){ call(err);return;}
                                        messages.database = data;
                                        call(null,messages);
                                    });
                }else{
                    GalleryModel.update({_id:body.id},
                                    {$set:{ gallery_name   : body.gallery_name,
                                            route_name     : body.route_name,
                                            aprasymas      : body.aprasymas}},
                                    function(err,data){ if(err){ call(err);return;}
                                    messages.database = data;
                                        call(null,messages);
                                    });
                }
            });
            }
/*********************** SEND RESPONSE TO USER ************************ */
            ],function(err,call){
            if(err){ res.json({message:'Gallery name not updated', error:err});
                return; }
                res.json({message:'Successfully updated gallery name.', call});
            });
        }
    }else
        res.json({message: 'No foler name was provided.'});
});      
module.exports = router;
