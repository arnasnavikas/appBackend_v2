var MyTeamModel = require('../mongoDB/team-member-model')
var express = require('express');
var router = express.Router();
var async = require('async');

router.post('/add-member', function(req, res, next){
    var body = JSON.parse(req.body.data);
                new MyTeamModel(body).save(function(err,data){
                    if(err){res.json(err);return;}
                    res.json(data);
                });
}).get('/get-members', function(req, res, next){
    MyTeamModel.find(function(err,data){
        if(err){res.json(err);return;}
        res.json(data);
    });
}).put('/update-member',function(req,res,end){
    var body = JSON.parse(req.body.data);
    MyTeamModel.update({_id:body._id},{ name: body.name,     
                                        forname: body.forname,  
                                        age: body.age,      
                                        images: body.images,   
                                        profesion: body.profesion,
                                        hobby: body.hobby,     
                                        status: body.status,  
                                        message: body.message,  
                                        date: body.date,
                                        days_left: body.days_left},
                         function(err,data){
                         if(err){res.json(err);return;}
                         res.json(data);  
                   });

}).put('/delete-member',function(req,res,end){
    var member_ids = JSON.parse(req.body.data)
    MyTeamModel.remove({ _id: { $in: member_ids } },function(err,data){
        if(err){res.json(err);return;}
        res.json(data);        
    });
});

module.exports = router;
