var express = require ('express');
var router = express.Router();
var myResumeModel = require('../mongoDB/my-resume-model');
router.post('/',function(req,res,next){
    var body = JSON.parse(req.body.data);
    var myInfo = new myResumeModel(body);
    myResumeModel.collection.drop();
    myInfo.save(function(err,saved){
        if(err){res.json(err);return;}
        res.json(saved);
        return;
    });
})
.get('/',function(req,res,next){
    myResumeModel.findOne(function(err,data){
        if(err){res.json(err);return;}
        res.json(data);
    });
});

module.exports = router;