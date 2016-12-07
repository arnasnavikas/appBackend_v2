var express = require('express');
var router = express.Router();
var fs = require('fs');

router.post('/', function(req,res,next){
// data from client
var formData = req.body.data;
var dataTo_JSON = JSON.parse(formData);
var GalleryName = dataTo_JSON.pavadinimas;
var GalleryDescription = dataTo_JSON.aprasymas; 

    function ensureExists(path, mask, cb) {
        if (typeof mask == 'function') { // allow the `mask` parameter to be optional
            cb = mask;
            mask = 0777;
        }
        fs.mkdir(path, mask, function(err) {
            if (err) {
                if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
                else cb(err); // something else went wrong
            } else cb(null); // successfully created folder
        });
    }       

    ensureExists('/home/arnas/nodeJS/my-app/backend/public/images/'+GalleryName, 0744, function(err) {
        if (err) // handle folder creation error
            res.json({message: err, name: GalleryName});
        else // we're all good
            res.json({message: 'created', name: GalleryName});
    });

});

module.exports = router;