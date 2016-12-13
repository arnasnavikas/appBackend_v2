var express = require('express');
var multer = require('multer');
var fs = require('fs-extra');
var stream = require('stream');
var router = express.Router();
var custom_paths = require('./paths');

var upload = multer({
    inMemory: true
});

/*##########################################################
saving images to folder
############################################################ */
router.post('/:folder', upload.any(),  (req,res,next)=>{

    var files = req.files;
    console.log(files);
    var folder = req.params.folder;
    var bufferStream = new stream.PassThrough();
    bufferStream.end(new Buffer(files[0].buffer));
    
    var writeFile = fs.createWriteStream(custom_paths.public_images_folder+folder+'/'+Date.now()+'.JPG');
    var pipe = bufferStream.pipe(writeFile);

     writeFile.on('close', function () { 
         console.log('finished');
        res.json({message: 'uploaded'});
      });
});
  module.exports = router;