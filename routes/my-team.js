var MyTeamModel = require('../mongoDB/team-member-model')
var express = require('express');
var router = express.Router();
var async = require('async');
var fs = require('fs-extra');
var customPaths = require('./paths');
var groupModel = require('../mongoDB/group-model')
var GalleryModel = require('../mongoDB/gallery_schema');
var PictureModel = require('../mongoDB/picture-schema');
var TableRowModel = require('../mongoDB/table-row-schema');

 
router.post('/add-member', function(req, res, next){
/*##############################################################
    CREATE NEW USER
###############################################################*/
    var body = JSON.parse(req.body.data);
    var user_folder_name = body.name +'_'+Date.now();
    body['folder_name'] = user_folder_name;

    async.parallel([function(call){
     /*********************** ADD USER TO DATABASE ***************** */
        new MyTeamModel(body).save(function(err,data){
            if(err){res.json(err);return;}
            call(null,data);
        });
    },function(call){
     /*********************** ADD USER FOLDER TO FYLE SYSTEM ***************** */
        var route = customPaths.public_folder+'/'+user_folder_name
        fs.mkdir(route,function(err,data){
            if(err){ call(err); return;}
            call(null, user_folder_name);   
        });
    }],function(err,call){
        if(err){ res.json(err); return;}
        res.json(call);
    });
}).get('/get-members', function(req, res, next){
    /*##############################################################
        FINDS ALL USERS
    ###############################################################*/
        MyTeamModel.find(function(err,data){
            if(err){res.json(err);return;}
            res.json(data);
        });
  }).get('/:user_id', function(req, res, next){
  /*##############################################################
      FINDS SPECIFIC USER
  ###############################################################*/
        var user_id = req.params.user_id;
        MyTeamModel.findOne({_id:user_id},function(err,data){
            if(err){res.json(err);return;}
            res.json(data);
        });
    }).put('/update-member',function(req,res,end){
/*##############################################################
    UPDATE USER INFO
###############################################################*/
    var body = JSON.parse(req.body.data);
    MyTeamModel.update({_id:body._id},{ name: body.name,     
                                        forname: body.forname,  
                                        age: body.age,      
                                        profesion: body.profesion,
                                        hobby: body.hobby,
                                        phone:body.phone,
                                        email: body.email},
                         function(err,data){
                         if(err){res.json(err);return;}
                         res.json(data);  
                   });
}).put('/update-status',function(req,res,end){
/*##############################################################
    UPDATE USER STATUS
###############################################################*/
        var body = JSON.parse(req.body.data);
        MyTeamModel.update({_id:body._id},{ status: body.status,  
                                            message: body.message,  
                                            date: body.date,
                                            days_left: body.days_left,
                                            updated: Date.now() },
                             function(err,data){
                             if(err){res.json(err);return;}
                             res.json(data);  
                       });
    
}).post('/add-pictures/:user_id',function(req,res,end){
 /*##############################################################
     ADD PICTURES TO USER 
 ###############################################################*/
 var user_id = req.params.user_id;
 var body = JSON.parse(req.body.data);
 MyTeamModel.update({_id:user_id},{ $push: { images: { $each: body } } },
                      function(err,data){
                      if(err){res.json(err);return;}
                      res.json(data);  
                });

}).put('/remove-pictures/:user_id',function(req,res,end){
    /*##############################################################
        DELETES PICTURES FROM USER 
    ###############################################################*/
    var user_id = req.params.user_id;
    var body = JSON.parse(req.body.data);
    var pictures_id = [];
    for(var picture of body)
        pictures_id.push(picture._id)
    console.log(pictures_id)
    MyTeamModel.update({_id:user_id},{ $pull: { images:{_id:{$in:pictures_id}}} },
                         function(err,data){
                         if(err){res.json(err);return;}
                         res.json(data);  
                   });
   
   }).put('/delete-member',function(req,res,end){
/*##############################################################
    DELETES USER
###############################################################*/
    var member_ids = JSON.parse(req.body.data);
    var log_file = [];
    (function iterator(i){
        if(i >= member_ids.length){
          res.json(log_file);
          return;
        } 
        async.waterfall([
            function(call){
     /*********************** FINDS USER IN DATABES AND DELETE THAT USER ***************** */
                MyTeamModel.findOneAndRemove({_id:member_ids[i]},function(err,user){
                    if(err){call(err);return;}
                    call(null,user)
                })
            },function(user,call){
                var folderPath = customPaths.public_folder+'/'+user.folder_name;
                fs.stat(folderPath, (err,stat) => {
                    if(stat){
                        fs.remove(folderPath,function(err){
                            if(err){log_file.push(err);call(err);return;}
                            log_file.push({status:'deleted',path:folderPath});
                            call(null,user);
                        });
                    }else{
                        res.status(500).send('no path with name - '+folderPath);
                        return;
                    }
                  });
            },function(user,call){
     /*********************** DELETES USER GALLERYS FROM DATABASE ***************** */
                GalleryModel.remove({user_id:user._id},function(err,data){
                    if(err){call(err);return;}
                    log_file.push(data);
                    call(null,user)
                });
            },function(user,call){
     /*********************** DELETES USER GALLERYS PICTURES FROM DATABASE ***************** */
                PictureModel.remove({user_id:user._id},function(err,data){
                    if(err){call(err);return;}
                    log_file.push(data);
                    call(null,user)
                });
            },function(user,call){
     /*********************** DELETES USER GROUPS FROM DATABASE ***************** */
                groupModel.remove({user_id:user._id},function(err,data){
                    if(err){call(err);return;}
                    log_file.push(data);
                    call(null,user)
                });
            },function(user,call){
     /*********************** DELETES USER TABLE ROWS FROM DATABASE ***************** */
                TableRowModel.remove({user_id:user._id},function(err,data){
                    if(err){call(err);return;}
                    log_file.push(data);
                    call(null,user)
                });
            }],function(err,call){
            if(err){res.json(err);return;}
            iterator(i+1);
        });
    })(0);
});

module.exports = router;
