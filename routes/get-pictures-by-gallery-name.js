var express = require('express');
var router = express.Router();
var GalleryModel = require('../mongoDB/gallery_schema');

/*##############################################################
 Loads gallery
 ###############################################################*/
router.get('/:galleryName', function(req, res, next) {
  console.log(req.params.galleryName);
   GalleryModel.findOne({route_name:req.params.galleryName},function(err,data){
     if(err){ res.json(err); return; }
     console.log(data);
     res.json(data);
   });
});

module.exports = router;