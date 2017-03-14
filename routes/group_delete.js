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
router.put('/',function(req,res,next){
    var groups = JSON.parse(req.body.data);
    var responseInfo = [];
   (function repeat(i){
       if(i >= groups.length){
        res.json({ids:responseInfo});
        return;
       }
       console.log(groups[i]);
        async.parallel([
            function(call){
                /** 1) finds group in database
                 *  2) delete group folder by route name from fyle sysytem
                 *  3) deletes group from database
                 */
                async.waterfall([
                    function(clb){
                        groupModel.findOne({_id:groups[i]},function(err,group){
                            if(err){console.log(err); call(err);return;}
                            console.log(group);
                            clb(null,group);
                        });
                    },function(group,clb){
                        fs.remove(customPaths.public_folder+group.route,function(err){
                            if(err){call(err);return;}
                            clb(null,group);
                        });

                    },function(group,clb){
                       groupModel.remove({_id:group._id},function(err,data){
                           if(err){call(err); return;}
                           clb(null,data);
                       });
                    }
                ],function(err,clb){
                    if(err){call(err);return;}
                    call(null,clb);
                });
                /** deletes all messages from database that beolong to group */
            },function(call){
                messageModel.remove({group_id:{$in:groups[i]}},function(err,data){
                    if(err){call(err);return;}
                    call(null,data);
                });
                /** deletes all gallerys from database that beolong to group */
            },function(call){
                galleryModel.remove({group_id:{$in:groups[i]}},function(err,data){
                    if(err){call(err);return;}
                    call(null,data);
                });
                /** deletes all tables from database that beolong to group */
            },function(call){
                tableModel.remove({group_id:{$in:groups[i]}},function(err,data){
                    if(err){call(err);return;}
                    call(null,data);
                });
            }   
        ],function(err,call){
            if(err){console.log('this is error'); res.json(err);return;}
            responseInfo.push(call);
            repeat(i+1);
        });
   })(0)
});

module.exports = router;