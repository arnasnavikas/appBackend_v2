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
router.put('',function(req,res,next){
    let group_ids = JSON.parse(req.body.data);
    var successLog = [];
    var errorLog = [];
    (function iterator(i){
        if(i >= group_ids.length){
          res.json({message: 'delete comlete',ok:successLog,error:errorLog});
          return;
        } 
        /** 1) finds group in database
         *  2) delete group folder by folder_name from fyle sysytem
         *  3) deletes group from database
         *  4) deletes gallerys from database, witch belongs to group
         *  5) deletes tables from database, witch belongs to group
         */
        async.waterfall([
            function(clb){
                groupModel.findOne({_id:group_ids[i]},function(err,data){
                    if(err){errorLog.push({groupFind:err}); clb(err);return;}
                    successLog.push(data)
                    clb(null,data)
                })
            },function(data,clb){
                async.parallel([
                    function(call){
                        var folderPath = customPaths.public_folder+'/'+data.folder_name;
                        fs.remove(folderPath,function(err){
                            if(err){errorLog.push(err);call(err);return;}
                            call(null,{fileSystem:true,path:folderPath});
                        });
                    },function(call){
                       groupModel.remove({_id:group_ids[i]},function(err,data){
                           if(err){errorLog.push({groupModel:err});call(err); return;}
                           call(null,data);
                       });
                    },function(call){
                        /** deletes all gallerys from database that beolong to group */
                        galleryModel.remove({group_id:{$in:group_ids[i]}},function(err,data){
                            if(err){errorLog.push({galleryModel:err});call(err);return;}
                            call(null,data);
                        });
                        /** deletes all tables from database that beolong to group */
                    },function(call){
                        tableModel.remove({group_id:{$in:group_ids[i]}},function(err,data){
                            if(err){errorLog.push({tableModel:err});call(err);return;}
                            call(null,data);
                        });
                    }   
                ],function(err,call){
                    if(err){res.json({async:err,function:errorLog});return;}
                    successLog.push(call)
                    clb(null,null)
                });
            }
        ],function(err,clb){
            if(err){res.json(err);return;}
            iterator(i+1)
        })
    })(0);
});

module.exports = router;