var express = require('express');
var router = express.Router();
var fs = require ('fs-extra');
var async = require ('async');
var load_gallery = require('../routes_functions/galerija_functions');
var custom_paths = require('./paths');


/*##############################################################
 Loads pictures from selected folder
 ###############################################################*/
router.get('/:id', function(req, res, next) {
  var folder_name = req.params.id;

  async.waterfall([
        function(call){
          load_gallery.load_album(folder_name,function(err, result){
              if(err) call(err);
              call(null,result);
          });
        } 
      ],function(err,call){
        // jei paskutine funkcja is async.waterfall grazina klaida
          if(err){
           res.json({"err": err, message:"error from selected_gallery.js file."});
           return;
          }

        // jei paskutine funkcija grazina duomenis
          res.json(call);
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
    console.log(folder);
    var parsed = folder.split(',');
    console.log(parsed);

    var folder_length = parsed.length;
    var x = 0;
    for( var name of parsed){
      fs.remove(custom_paths.public_images_folder+name, function(err){
        if(err){
          res.json({error:err});
          return;
        }
      });
        x++;
      if(folder_length<=x)
        res.json({message: 'Deleted all.' });
    }
/*##############################################################
 Delete selected pictures from  folder 
 ###############################################################*/
  }).put('/', function(req,res,next){
    var body = req.body.data;
    var to_JSON = JSON.parse(body);
    var x =0;
    for(x; x<to_JSON.images.length; x++){

      fs.remove(custom_paths.public_images_folder+to_JSON.folder+'/'+to_JSON.images[x], function(err){
        if(err) {
          res.json({error:err});
          return;
        }
      });
    }

     res.json({message:'Deleted all selected images.'});
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
