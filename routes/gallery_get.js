var express = require('express');
var router = express.Router();
var GalleryModel = require('../mongoDB/gallery_schema');

/*##############################################################
 Loads all gallerys folders 
 ###############################################################*/
router.get('/:id', function(req, res, next){
   GalleryModel.find({group_id:req.params.id},function(err,data){
     if(err){ res.json(err); return; }
     res.json(data);
   });
}).get('/', function(req,res,next){
   GalleryModel.find(function(err,data){
     if(err){ res.json(err); return;}
     res.json(data);
   });
});

module.exports = router;