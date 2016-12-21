var express = require('express');
var router = express.Router();
var fs = require ('fs-extra');
var async = require ('async');
var custom_paths = require('./paths');
var GalleryModel = require('../mongoDB/gallery_schema');



/*##############################################################
 Loads pictures from selected folder
 ###############################################################*/
router.get('/:id', function(req, res, next) {
  var folder_name = req.params.id;
  console.log(folder_name);
  GalleryModel.find({route_name: folder_name},function(err,data){
    if(err){
       res.json({"err": err, message:"Cant load picture from database"});
       return;
    }
       res.json(data[0]);
  });
})
/*##############################################################
 Loads all gallerys folders 
 ###############################################################*/
.get('/', function(req, res, next) {
   GalleryModel.find(function(err,data){
     if(err){
       res.json({message:'Cant load albums.', error: err});
       return;
     }
     res.json(data);
   });
/*##############################################################
 Delete selected pictures from  folder 
 ###############################################################*/
}).put('/', function(req,res,next){

    var body = req.body.data;
    var picture_obj = JSON.parse(body);
    console.log(picture_obj);
    async.parallel([
      /*********************** REMOVES PICTURES FROM DATABASE ************************ */
      function(call){
        (function iterator(i){
              if(i >= picture_obj.images.length){
                call(null,{message:'Deleted all records'});
                return;
              } 
            console.log('times run '+ i);
          GalleryModel.update({route_name: picture_obj.folder}, {$pull:{gallery_images:{_id:picture_obj.images[i]}}},function(err,data){
              if(err){
                call({erro:err, message:'Cant delete picture'});
                return;
              }
              console.log(data);
              iterator(i+1);
            });
        })(0);
      },function(call){
      /*********************** REMOVES PICTURES FROM FILE SYSTEM ************************ */
        (function iterator(i){
              if(i >= picture_obj.imagesNames.length){
                call(null,{message:'Deleted all selected images.'});
                return;
              } 
          fs.remove(custom_paths.public_images_folder+picture_obj.folder+'/'+picture_obj.imagesNames[i], function(err){
            if(err) {
              call(err);
            }
              iterator(i+1);
          });
        })(0);
      }
    ],function(err,call){
      if(err)
        res.json({err:err});
      
      res.json({message:call});
    });
/*##############################################################
 * Rename existing gallery
 ###############################################################*/
  }).post('/', function(req,res, next){

    var body = JSON.parse(req.body.data);
    var new_name = body.new_name.replace(/ /g, "_");
    console.log(body);
    async.parallel([
      /*********************** RENAME GALLERY IN FILE SYSTEM ************************ */
      function(call){
        fs.rename(custom_paths.public_images_folder+body.old, 
                  custom_paths.public_images_folder+new_name, function(err){
                    if(err){
                      call({error: err, message: 'cant rename in folder in fyle system'});
                      return;
                    } 
                    call(null,'Reanamed in file system.')
                  });
      /*********************** RENAME GALLERY IN DATABASE ************************ */
    },function(call){
      GalleryModel.update({_id:body.gallery_id},{$set:{gallery_name:body.new_name, route_name: new_name}},function(err,data){
        if(err){
          call({error:err, message:'Cant update gallery name in database'});
          return;
        }
        call(null,{message:"Updated in database.",data:data});
      });
    },function(call){
      GalleryModel.find({_id:body.gallery_id},function(err,data){
        if(err){
          call({error:err, message: 'cant fing gallery'});
          return;
        }
        var picture_array = [];
        if(data[0].gallery_images.length >0 ){
          for(var z=0; z< data[0].gallery_images.length; z++){
             var x =  data[0].gallery_images[z];
            picture_array.push(x.img_src);
          }
        }
        console.log(picture_array);
        if(data[0].gallery_images.length > 0){
          (function iterator(i){
            if(i==picture_array.length){
              call(null,'Updated all images sources');
              return;
            }
            var picture_name = picture_array[i].slice(-17);
            var picture_path = custom_paths.images_location+new_name+'/'+picture_name;
            console.log(picture_name);
            GalleryModel.update({_id:body.gallery_id, gallery_images:{$elemMatch:{img_src:picture_array[i]}}}, {$set:{"gallery_images.$.img_src": picture_path}},function(err,data){
              if(err){
                call({error:err, message:'cant update gallery image source field.'});
                return;
              }
              // console.log(data);
            });
              iterator(i+1);
          })(0);
        }else
          call(null,'nothing to update');
      });
    }
      /*********************** SEND RESPONSE TO USER ************************ */
    ],function(err,call){
      if(err){
        res.json({message:'Gallery name not updated', error:err});
        return;
      }
        res.json({message:'Successfully updated gallery name.', data:call});
    });
  });
  

module.exports = router;
