var express = require ('express');
var router = express.Router();
var fs = require('fs-extra');
var async = require ('async');
var groupModel = require('../mongoDB/group-model')
var messageModel = require('../mongoDB/mail_schema');
var galleryModel = require('../mongoDB/gallery_schema');
var customPaths = require('./paths');
var TableRowModel = require('../mongoDB/table-row-schema');
var PictureModel = require('../mongoDB/picture-schema');

/**#############################################
 * sukuria nauja grupe
 *##############################################*/
router.post('/create',function(req,res,next){
  var group_data = JSON.parse(req.body.data);
    async.waterfall([
        function(call){
///*************************  CREATE GROUP FOLDER IN FYLE SYSTEM **************************** */
            let route = customPaths.public_folder+'/'+group_data.user_folder+'/'+group_data.folder_name
            fs.mkdir(route,function(err,data){
                if(err){ call(err); return;}
                console.log(Date.now())
                call(null, group_data);   
            });
        },
///*************************  CREATE GROUP COLLECTION IN DATA BASE **************************** */
        function(data,call){
            var newGroup = new groupModel(data);
            newGroup.save(function(err,group){
                if(err){ call(err); return;}
                call(null,group);
            });
        },function(group,call){
///*************************  CREATE FIRST ROR IN TABLE COLLECTION  **************************** */
            var tableRow = new TableRowModel({group_id:group._id,user_id:group.user_id});
            tableRow.save(function(err,data){
                if(err){call(err);return;}
                call(null,group);
            })
        }
    ],function(err,data){
        if(err){ res.json(err);return;}
        res.json(data);
    });
}).get('/:user_id',function(req,res,next){
/**#############################################
 * suranda visas grupes
 ###############################################*/
 var user_id =req.params.user_id;
groupModel.find({user_id:user_id},function(err,data){
           if(err){call(err);return;}
           res.json(data);
       });
}).get('/one/:group_id',function(req,res,next){
    /**#############################################
     * suranda viena grupe
     ###############################################*/
     var group_id =req.params.group_id;
    groupModel.findOne({_id:group_id},function(err,data){
               if(err){call(err);return;}
               res.json(data);
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
    var body = JSON.parse(req.body.data); // {name:'',route:'',id :''}
            groupModel.update({_id:body.id},{name: body.name,route:body.route},function(err,data){
                if(err){res.json(err);return;}
                res.json(data);
            });
/**#############################################
 * priskiria grupes paveiksliukus
 ###############################################*/
}).post('/add-cover/:group_id',function(req,res,next){
        var body = JSON.parse(req.body.data);
            groupModel.update({_id:req.params.group_id},
                { $push: { imgURL: { $each: body } } },function(err,data){
                    if(err){res.json(err);return;}
                    res.json(data);
                });
/*##############################################################
 Deletes group imgURL images 
 ###############################################################*/
}).put('/remove-cover/:group_id',function(req,res,next){
    var body = JSON.parse(req.body.data);
    var image_id = []
    for(var image of body)
        image_id.push(image._id)
        groupModel.update({_id:req.params.group_id},
            { $pull: { imgURL: { _id: { $in: image_id } } } }
            ,function(err,data){
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
                function(call){
///*************************  FIND GROUP **************************** */
                    groupModel.findOne({_id:group_ids[i]},function(err,data){
                        if(err){errorLog.push({groupFind:err}); call(err);return;}
                        successLog.push(data)
                        call(null,data)
                    });
                },function(data,call){
///*************************  DELETE FOLDER FROM FYLE SYSTEM **************************** */
                    var folderPath = customPaths.public_folder+'/'+data.user_folder+'/'+data.folder_name;
                    console.log(folderPath)
                    fs.stat(folderPath, (err,stat) => {
                        console.log(err)
                        console.log(stat)
                        if(stat){
                            fs.remove(folderPath,function(err){
                                if(err){errorLog.push(err);call(err);return;}
                                call(null,data);
                            });
                        }else{
                            res.status(500).send('no path with name - '+folderPath);
                            return;
                        }
                      });
                }
                ,function(data,call){
///*************************  DELETE GROUP DATA FROM DATABASE **************************** */
                   groupModel.remove({_id:group_ids[i]},function(err,data){
                       if(err){errorLog.push({groupModel:err});call(err); return;}
                       call(null,data);
                   });
                },
                function(data,call){
///*************************  DELETE GALLERYS DATA FROM DATABASE **************************** */
                    galleryModel.remove({group_id:{$in:group_ids[i]}},function(err,data){
                        if(err){errorLog.push({galleryModel:err});call(err);return;}
                        call(null,data);
                    });
                    /** deletes all tables from database that beolong to group */
                },function(data,call){
///*************************  DELETE TABLE ROWS DATA FROM DATABASE **************************** */
                    TableRowModel.remove({group_id:{$in:group_ids[i]}},function(err,data){
                        if(err){errorLog.push(err);call(err);return;}
                        call(null,data);
                    });
                },function(data,call){
///*************************  DELETE PICTURES DATA FROM DATABASE **************************** */
                    PictureModel.remove({group_id:{$in:group_ids[i]}},function(err,data){
                        if(err){errorLog.push(err);call(err);return;}
                        call(null,data);
                    });
                }   
            ],function(err,clb){
                if(err){res.json(err);return;}
                iterator(i+1)
            })
        })(0);
    });

module.exports = router;