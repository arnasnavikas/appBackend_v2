var express = require('express');
var router = express.Router();
var GalleryModel = require('../mongoDB/gallery_schema');

/*##############################################################
 Loads gallery
 ###############################################################*/
router.get('/:id', function(req, res, next) {
   GalleryModel.findOne({_id:req.params.id},function(err,data){
     if(err){ res.json(err); return; }
     res.json(data);
   });
});

module.exports = router;