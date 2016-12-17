var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var async = require('async');
var Readable = require('stream').Readable;
var custom_paths = require('./paths');

router.post('/', function(req,res,next){
// data from client
var formData = req.body.data;
var dataTo_JSON = JSON.parse(formData);
var GalleryName = dataTo_JSON.pavadinimas;
var GalleryDescription = dataTo_JSON.aprasymas; 


    async.waterfall([
        function(call){
            fs.mkdir(custom_paths.public_images_folder+GalleryName, function(err) {
                                if (err){
                                    if(err.code === 'EEXIST'){
                                        call('Tokia galerija jau egzistuoja.');
                                        return;
                                    }else 
                                        call(err);
                                        return;
                                }
                                    call(null, GalleryName);
                                });
        },function(gallery,call){
            fs.writeFile(custom_paths.public_images_folder+gallery+'/description.txt', GalleryDescription, function (err) {
            if (err)
                call(err);
            else
                call(null,null);
            });
        }
    ],function(err,call){
        if(err)
            res.json({err:err});
        else
            res.json({message:"Gallery successfully created."});    
    });

}).put('/', function(req,res, next){

    var body = JSON.parse(req.body.data);
    var folder = body.folder;
    var description = body.description;

    fs.writeFile(custom_paths.public_images_folder+folder+"/description.txt", description, (err) => {
        if (err) res.json({error: err});

        res.json({message: 'description updated'});
    });
});      


module.exports = router;
