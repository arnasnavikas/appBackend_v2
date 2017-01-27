var express         = require ('express');
var router          = express.Router();
var custom_paths    = require('./paths');
var GalleryModel    = require('../mongoDB/gallery_schema');

router.post('/:gallery',function(req,res,next){
var pictureName = JSON.parse(req.body.data);
var galleryName = req.params.gallery;
var index_path = custom_paths.images_location+galleryName+'/'+pictureName;
        
     GalleryModel.update({route_name: galleryName},{index_img:index_path},function(err,data){
         if(err){res.json(err); return;}
         res.json(data);
     });
});
module.exports = router;