var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var async = require('async');
var custom_paths = require('./paths');
var GalleryModel = require('../mongoDB/gallery_schema');
var GroupModel = require('../mongoDB/group-model');
/*##############################################################
    Create new gallery folder 
 ###############################################################*/
router.post('/', function(req,res,next){
// data structure
/** { gallery_name : 'data',
 *    aprasymas    : 'data',
 *    route_name   : 'nasm_sad_',
 *    group_name   : 'asd-asd',
 *    group_id     : 'asd-asd',
 *    folder_name  : 'asdasd'
 *  }
 */
var body = JSON.parse(req.body.data);
    async.parallel([
      /*********************** CREATE NEW FOLDER *********************** */
        function(call){
            fs.mkdir(custom_paths.public_folder+'/'+body.group_name+'/'+body.folder_name, function(err) {
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
    },function(call){
        var new_gallery = new GalleryModel(body);
        new_gallery.save(function(err,data){
            if(err){ call(err); return; }
            call(null, data);
        });
    }],function(err,call){
        if(err){res.json(err); return;}
        res.json(call);    
    });
 
/*##############################################################
    UPDATE GALLERY NAME
 ###############################################################*/
}).put('/', function(req,res,next){
    var data =JSON.parse(req.body.data)
    GalleryModel.update({_id:data.id},
        {$set:{ gallery_name   : data.name,
            route_name     : data.routeName}},
            function(err,data){
                if(err){ call(err);return;}
                res.json(data)
            });
            //     if(req.params.name){
                //     var body = JSON.parse(req.body.data);
                //     var oldName = req.params.name;
                //     var groupName = req.params['group'];
                //     var message ={ fyleSYS: undefined,
                //                    database: undefined
                //                  };
                // /*********************** ADD/UPDATE DESCRIPTION ************************ */
                //     if(body.route_name == oldName){
                    //             GalleryModel.update({_id: body.id},{aprasymas:body.aprasymas},function(err,data){
                        //                 if(err){
                            //                     res.json({message:'Record was not updated.', error: err});
                            //                     return;
                            //                 }
                            //                 message.database = 'description updated';
                            //                 res.json({message: message , data:data});
                            //             });
                            //             return;
                            //         }else{
                                //             async.waterfall([
                                    // /*********************** RENAME GALLERY IN FILE SYSTEM ************************ */
                                    //             function(call){
                                        //                 fs.rename(custom_paths.public_folder+groupName+'/'+oldName, 
                                        //                         custom_paths.public_folder+groupName+'/'+body.route_name, function(err){
                                            //                             if(err){ call({error: err, message: 'cant rename in folder in fyle system'});
//                                 return;
//                             } 
//                             message.fyleSYS = 'Reanamed in file system.';
//                             call(null,message)
//                         });
// /*********************** RENAME GALLERY IN DATABASE ************************ */
//             },function(messages,call){
    //             GalleryModel.findOne({_id:body.id},function(err,data){
        //                 if(err){
            //                     call({error:err, message: 'cant find gallery'});
            //                     return;
            //                 }
            //                 var pictures = data.gallery_images;
            //                 if(pictures.length > 0 ){
                //                     var new_route = custom_paths.images_location+groupName+'/'+body.route_name+'/';
                //                     var new_index_img;
                //                     if(data.index_img){
                    //                         var indexImgName = data.index_img.slice(-17);
                    //                         new_index_img = new_route+indexImgName;
                    //                     }
                    //                     for(var i=0; i < pictures.length; i++){
                        //                         var pictureName = pictures[i].img_src.slice(-17);
                        //                         pictures[i].img_src = new_route+pictureName;
                        //                     }
                        //                     GalleryModel.update({_id:body.id},
                        //                                     {$set:{ gallery_images : pictures, 
                        //                                             gallery_name   : body.gallery_name,
                        //                                             route_name     : body.route_name,
                        //                                             aprasymas      : body.aprasymas,
                        //                                             index_img      : new_index_img}},
                        //                                     function(err,data){ if(err){ call(err);return;}
                        //                                         messages.database = data;
                        //                                         call(null,messages);
                        //                                     });
                        //                 }else{
                            //                     GalleryModel.update({_id:body.id},
                            //                                     {$set:{ gallery_name   : body.gallery_name,
                            //                                             route_name     : body.route_name,
                            //                                             aprasymas      : body.aprasymas}},
                            //                                     function(err,data){ if(err){ call(err);return;}
                            //                                     messages.database = data;
                            //                                         call(null,messages);
                            //                                     });
                            //                 }
                            //             });
                            //             }
                            // /*********************** SEND RESPONSE TO USER ************************ */
                            //             ],function(err,call){
                                //             if(err){ res.json({message:'Gallery name not updated', error:err});
                                //                 return; }
                                //                 res.json({message:'Successfully updated gallery name.', call});
                                //             });
                                //         }
                                //     }else
                                //         res.json({message: 'No foler name was provided.'});
                                /*##############################################################
                                UPDATE GALLERY NAME
                                 ###############################################################*/
 }).post('/:id',function(req,res,next){
     var id = req.params.id
     var data = JSON.parse(req.body.data)
     GalleryModel.update({_id:id},
         {$set:{ aprasymas: data.description}},
             function(err,data){
                 if(err){ call(err);return;}
                 res.json(data)
             });
 });      
 module.exports = router;
                                