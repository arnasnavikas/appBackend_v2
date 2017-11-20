var express = require ('express');
var router = express.Router();
var fs = require('fs-extra');
var async = require ('async');
var categoryModel = require('../mongoDB/group-model')
var messageModel = require('../mongoDB/mail_schema');
var galleryModel = require('../mongoDB/gallery_schema');
var tableModel = require('../mongoDB/skaiciuokle_shema')
var customPath = require('./paths');
router.post('/',function(req,res,next){
  var data = JSON.parse(req.body.data);
    async.parallel([
        function(call){
            let route = customPath.public_folder+'/'+data.folder_name
            fs.mkdir(route,function(err,data){
                if(err){ call(err); return;}
                console.log(Date.now())
                call(null, data);
            });
        },
        function(call){
            var newGroup = new categoryModel(data);
            newGroup.save(function(err,data){
                if(err){ call(err); return;}
                call(null,data);
            });
        }
    ],function(err,data){
        if(err){ res.json(err);return;}
        res.json(data);
    });
})
/**#############################################
 * suranda viena grupe
 */
.get('/:route',function(req,res,next){
    var route = req.params.route;
        categoryModel.findOne({route:route},function(err,data){
            if(err){res.json(err); return;}
            res.json(data);
        });
})
/**#############################################
 * suranda visas grupes, ir tai grupei priklausanciu
 * neperskaitytu zinuciu kieki
 */
.get('/',function(req,res,next){
    async.waterfall([
        function(call){
            categoryModel.find(function(err,data){
                if(err){call(err);return;}
                call(null,data);
            });
        },function(data,call){
            var newData = [];
           (function repeat(i){
               var newMailLength = 0;
               if(i>= data.length){
                   call(null,newData);
                   return;
               }
            async.parallel([
                function(clb){
                    messageModel.find({group_id:data[i]._id},function(err,message){
                        if(err){call(err); return;}
                        for(var ii in message){
                            if(!message[ii].ziuretas)
                                newMailLength +=1;
                        }
                        clb(null,newMailLength);
                    });

               },function(clb){
                    galleryModel.find({group_id:data[i]._id},function(err,gallerys){
                        if(err){call(err); return;}
                        clb(null,gallerys.length);
                    });
               },function(clb){
                    tableModel.find({group_id:data[i]._id},function(err,tables){
                        if(err){call(err); return;}
                        clb(null,tables.length);
                    });
               }],function(err,clb){
                   if(err){call(err);return;}
                    data[i].newMessages = clb[0];
                    data[i].gallerys = clb[1];
                    data[i].tables = clb[2];
                //    console.log(data[i]);
                    newData.push(data[i]);
                    repeat(i+=1);
               })
           })(0);
        }
    ],function(err,call){
        if(err){res.json(err);return;}
        res.json(call);
    });
});

module.exports = router;