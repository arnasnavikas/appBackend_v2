var express = require ('express');
var router = express.Router();
var custom_paths = require('./paths');
var async = require('async');
var GalleryModel = require('../mongoDB/gallery_schema');

router.post('/',function(req,res,next){
var body = JSON.parse(req.body.data);
/**body = { folder: 'galerijos_pavadinimas',
 *          index: '12334234234.JPG',
 *          index_id: '585a78fcc7e36c05f41ba4c9',
 *          galerija_id: '585a78fcc7e36c05f41ba4c3'} */
var folder_name = body.folder.replace(/_/g," ");
async.waterfall([
    /***************************** UPDATES  INDEX PICTURE OF GALLERY IN DATABASE  ************************** */
 function(call){
        var index_path = custom_paths.images_location+body.folder+'/'+body.index;
        GalleryModel.update({_id:body.gallery_id},{index_img:index_path},function(err,data){
            if(err){
                call({error:err, message:'cant update index_img field in database.'});  
                return;
            }
            call(null,data);
        });
    }
],function(err,call){
    if(err){
        res.json({error: err, message: 'Ranaming failed.'});
        return;
    }
res.json({mesage: 'Renamig was successfull.'});
});


});

module.exports = router;