var express = require('express');
var multer = require('multer');
var fs = require('fs');
var stream = require('stream');
var router = express.Router();
var upload = multer({
    inMemory: true
});
/*##########################################################
saving images to folder
############################################################ */
router.post('/:folder', upload.any(),  (req,res,next)=>{
    
    var files = req.files;
    var folder = req.params.folder;
    var bufferStream = new stream.PassThrough();
    bufferStream.end(new Buffer(files[0].buffer));
    
    var writeFile = fs.createWriteStream('/home/arnas/nodeJS/my-app/backend/public/images/'+folder+'/'+Date.now()+'.JPG');
    var pipe = bufferStream.pipe(writeFile);

     pipe.on('finish', function () { 
         console.log('finished');
        res.json({message: 'uploaded'});
      });
});
  module.exports = router;