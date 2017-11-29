var statusModel = require('../mongoDB/status-model')
var express = require('express');
var router = express.Router();
var async = require('async');

router.get('/get-status', function(req, res, next){
    statusModel.find(function(err,data){
        if(err){res.json(err);return;}
        res.json(data);
    });
}).put('/update/:id',function(req,res,end){
    var body = JSON.parse(req.body.data);
    statusModel.update({_id:req.params.id},{status: body.status,  
                                            message: body.message,  
                                            date: body.date,
                                            days_left: body.days_left},
                                                function(err,data){
                                                if(err){res.json(err);return;}
                                                res.json(data);  
                                            });

}).post('/new',function(req,res,end){
    var body = JSON.parse(req.body.data);
    var newStatus = new statusModel(body)
    console.log(body)
    newStatus.save(function(err,data){
        if(err){res.json(err);console.log(err);return;}
        res.json(data);        
    });
});

module.exports = router;
