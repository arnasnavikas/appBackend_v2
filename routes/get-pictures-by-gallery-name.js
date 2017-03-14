var express = require('express');
var router = express.Router();
var GalleryModel = require('../mongoDB/gallery_schema');

/*##############################################################
 Loads gallery
 ###############################################################*/
router.get('/:galleryName', function(req, res, next) {
   GalleryModel.findOne({route_name:req.params.galleryName},function(err,data){
     if(err){ res.json(err); return; }
     res.json(data);
   });
});

module.exports = router;