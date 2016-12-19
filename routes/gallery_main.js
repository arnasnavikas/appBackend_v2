var express = require('express');
var router = express.Router();
var fs = require ('fs-extra');
var async = require ('async');
var load_gallery = require('../routes_functions/galerija_functions');
var custom_paths = require('./paths');
var GalleryModel = require('../mongoDB/gallery_schema');



/*##############################################################
 Loads pictures from selected folder
 ###############################################################*/
router.get('/:id', function(req, res, next) {
  var folder_name = req.params.id;

  GalleryModel.find({gallery_name: folder_name},function(err,data){
    if(err){
       res.json({"err": err, message:"error from selected_gallery.js file."});
       return;
    }

       res.json(data);
  });
})
/*##############################################################
 Loads all gallerys folders 
 ###############################################################*/
.get('/', function(req, res, next) {
  
  // suranda visus failus nurodytame aplanke
  load_gallery.findFolders('images',function(err,data){
    // patkrina ar rasti failai yra direktorijos
    load_gallery.isFolder(data, function(err,data){
      // sukonstruoja array ir issiuncia 
      load_gallery.folderLoop(data,function(err,data){
                      if(err){
                        res.send(err);
                        return;
                      }
                        res.json( data);
      });
    });
  });
})
/*##############################################################
 Delete selected gallery folder 
 ###############################################################*/
.delete('/:folder', function(req,res,next){
    var folder = req.params.folder;
    var folders_array = folder.split(',');
    var folders_array_length = folders_array.length;
    async.parallel([
      function(call){
        (function iterator(i){
          if(i >= folders_array_length){
            call(null,'Deleted');
            return;
          } 
          fs.remove(custom_paths.public_images_folder+folders_array[i], function(err){
            if(err)
              call(err);

              iterator(i+1);
         });
        })(0);
      },function(call){
      /*********************** DELETING RECORS FROM DATABASE ************************ */
        GalleryModel.remove({gallery_name:{$in:folders_array}},function(err){
          if(err)
          call(err);
          
          call(null,null);
        });
      }
    ],function(err,call){
      if(err)
        res.json(err);
      res.json({message:'Gallerys deleted : '+folders_array});
    })


/*##############################################################
 Delete selected pictures from  folder 
 ###############################################################*/
  }).put('/', function(req,res,next){
    var body = req.body.data;
    var picture_obj = JSON.parse(body);
    async.parallel([
      function(call){
        (function iterator(i){
              if(i >= picture_obj.images.length){
                call(null);
                return;
              } 
          GalleryModel.update({gallery_name: picture_obj.folder}, {$pull:{gallery_images:{_id:picture_obj.images[i]}}},function(err){
              if(err)
                call(err);
              iterator(i+1);
            });
        })(0);
      },function(call){
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
    console.log(body);

    fs.rename(custom_paths.public_images_folder+body.old, 
              custom_paths.public_images_folder+body.new_name, function(err){
                if(err){
                  res.json({message: err});
                  return;
                } 

                res.json({message: 'renamed'});
              });
  });
  

module.exports = router;
