var express = require ('express');
var router = express.Router();
var fs = require('fs-extra');
var async = require ('async');
var groupModel = require('../mongoDB/group-model')
var messageModel = require('../mongoDB/mail_schema');
var galleryModel = require('../mongoDB/gallery_schema');
var tableModel = require('../mongoDB/skaiciuokle_shema')
var customPaths = require('./paths');

/**#############################################
 * sukuria nauja grupe
 *##############################################*/
router.post('/create',function(req,res,next){
  var data = JSON.parse(req.body.data);
    async.parallel([
        function(call){
            let route = customPaths.public_folder+'/'+data.folder_name
            fs.mkdir(route,function(err,data){
                if(err){ call(err); return;}
                console.log(Date.now())
                call(null, data);   
            });
        },
        function(call){
            var newGroup = new groupModel(data);
            newGroup.save(function(err,data){
                if(err){ call(err); return;}
                call(null,data);
            });
        }
    ],function(err,data){
        if(err){ res.json(err);return;}
        res.json(data);
    });
/**#############################################
 * suranda viena grupe
 ###############################################*/
}).get('/:group_id',function(req,res,next){
    var group_id = req.params.group_id;
        groupModel.findOne({_id:group_id},function(err,data){
            if(err){res.json(err); return;}
            res.json(data);
        });
/**#############################################
 * suranda visas grupes, ir tai grupei priklausanciu
 * neperskaitytu zinuciu kieki
 ###############################################*/
}).get('/',function(req,res,next){
    async.waterfall([
        function(call){
            groupModel.find(function(err,data){
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
}).put('/add-description',function(req,res,next){
 /**#############################################
  * atnaujina grupes aprasyma
  ###############################################*/
    var body = JSON.parse(req.body.data);
    
    groupModel.update({_id:body.id},
        {description: body.description},function(err,data){
            if(err){res.json(err);return;}
            res.json(data);
        });
    }).put('/rename',function(req,res,next){
/**#############################################
 * atnaujina grupes pavadinima
 ###############################################*/
    var body = JSON.parse(req.body.data); // {pavadinimas:'',route:'',imgURL:'',aprasymas:''}
    groupModel.update({_id:body.id},{name: body.name,route:body.route},
        function(err,data){
            if(err){res.json(err);return;}
            res.json(data);
        });
/**#############################################
 * priskiria grupes paveiksliuka 
 ###############################################*/
}).post('/add-cover',function(req,res,next){
        var body = JSON.parse(req.body.data);
            groupModel.update({_id:body._id},
                {imgURL: body.imgURL},function(err,data){
                    if(err){res.json(err);return;}
                    res.json(data);
                });
/*##############################################################
 Deletes multiple groups that specified in data:[] array
 ###############################################################*/
}).put('/delete',function(req,res,next){
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