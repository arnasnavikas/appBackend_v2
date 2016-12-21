var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var async = require('async');
var custom_paths = require('./paths');
var GalleryModel = require('../mongoDB/gallery_schema');

/*##############################################################
    Create new gallery folder 
 ###############################################################*/
router.post('/', function(req,res,next){
// data structure
/** { "pavadinimas" : "data",
 *    "aprasymas" : "data",
 *  }
 */
var formData = JSON.parse(req.body.data);
    var check_params = function(params){
        var found=0;
        for(var param of params){
            console.log(param);
            if(param == 'pavadinimas' || param =='aprasymas'){
                found++;
            }
        }
        return found;
    }
    var _param_from_req = Object.keys(formData);
      /******************* CHECK IF PARAMETER FROM REQUEST BODY ARE VALID ************** */
if(check_params(_param_from_req) == 2){
    var _gallery_name = formData.pavadinimas.replace(/ /g, "_");
    async.waterfall([
      /*********************** CREATE NEW FOLDER *********************** */
        function(call){
            fs.mkdir(custom_paths.public_images_folder+_gallery_name, function(err) {
                                if (err){
                                    if(err.code === 'EEXIST'){
                                        call('Tokia galerija jau egzistuoja.');
                                        return;
                                    }else 
                                        call(err);
                                        return;
                                }
                                    call(null, _gallery_name);
                                });
      /*********************** CREATE NEW GALLERY DOCUMENT IN DATABASE ******************** */
        },function(gallery,call){
            
            var new_gallery = new GalleryModel({
                                gallery_name: formData.pavadinimas,
                                route_name: gallery,
                                aprasymas: formData.aprasymas
                            });
                new_gallery.save(function(err,data){
                    if(err){
                        call({message:'Cant create new gallery.', error: err});
                        return;
                    }
                    call(null, data);
                });
        }
    ],function(err,call){
        if(err){
            res.json({err:err});
            return;
        }
        else
            res.json({message:"Gallery successfully created.", data:call});    
    });
 }else{
     res.json({message:'bad params.'});
 }
/*##############################################################
    Change gallery description
 ###############################################################*/
}).put('/', function(req,res, next){

    var body = JSON.parse(req.body.data);
    console.log(body);
 
        GalleryModel.update({_id: body.folder},{aprasymas:body.description},function(err,data){
            if(err){
                res.json({message:'Record was not updated.', error: err});
                return;
            }
            res.json({message: 'description updated', data:data});
        });
    
});      


module.exports = router;
