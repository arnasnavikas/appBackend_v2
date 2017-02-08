var express = require('express');
var router = express.Router();
var async = require('async');
var fs = require('fs-extra');
var customPaths = require('./paths');
var groupModel = require('../mongoDB/group-model');
var messageModel = require('../mongoDB/mail_schema');
var galleryModel = require('../mongoDB/gallery_schema');
var tableModel = require('../mongoDB/skaiciuokle_shema');

/*##############################################################
 Loads all gallerys folders 
 ###############################################################*/
router.put('/:id/:folder',function(req,res,next){
    var group_id = req.params.id;
    var folder_name = req.params.folder;
    async.parallel([
        function(call){
            fs.remove(customPaths.public_folder+folder_name,function(err){
                if(err){call(err);return;}
                call(null,'folder deleted');
            });
        },function(call){
            groupModel.remove({_id:group_id},function(err,data){
                if(err){call(err); return;}
                call(null,data);
            });
        },function(call){
            messageModel.remove({group_id:{$in:group_id}},function(err,data){
                if(err){call(err);return;}
                call(null,data);
            });
        },function(call){
            galleryModel.remove({group_id:{$in:group_id}},function(err,data){
                if(err){call(err);return;}
                call(null,data);
            });
        },function(call){
            tableModel.remove({group_id:{$in:group_id}},function(err,data){
                if(err){call(err);return;}
                call(null,data);
            });
        }   
    ],function(err,call){
        if(err){res.json(err);return;}
        res.json(call);
    });
});

module.exports = router;