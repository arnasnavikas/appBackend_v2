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
 Deletes groups that specified in data:[] array
 ###############################################################*/
router.put('/:id/:folderName',function(req,res,next){
    let group_id = req.params.id
    let folder =  req.params.folderName
        async.parallel([
            /** 1) finds group in database
             *  2) delete group folder by route name from fyle sysytem
             *  3) deletes group from database
             */
            function(call){
                fs.remove(customPaths.public_folder+'/'+folder,function(err){
                    if(err){call(err);return;}
                    call(null,'removed');
                });

            },function(call){
               groupModel.remove({_id:group_id},function(err,data){
                   if(err){call(err); return;}
                   call(null,data);
               });
            },function(call){
                /** deletes all messages from database that beolong to group */
            messageModel.remove({group_id:{$in:group_id}},function(err,data){
                if(err){call(err);return;}
                call(null,data);
            });
            /** deletes all gallerys from database that beolong to group */
            },function(call){
                galleryModel.remove({group_id:{$in:group_id}},function(err,data){
                    if(err){call(err);return;}
                    call(null,data);
                });
                /** deletes all tables from database that beolong to group */
            },function(call){
                tableModel.remove({group_id:{$in:group_id}},function(err,data){
                    if(err){call(err);return;}
                    call(null,data);
                });
            }   
        ],function(err,call){
            if(err){console.log('this is error'); res.json(err);return;}
            res.json(call);
        });
});

module.exports = router;