var express = require ('express');
var router = express.Router();
var myResumeModel = require('../mongoDB/my-resume-model');
router.post('/',function(req,res,next){
    var body = JSON.parse(req.body.data);
    var myInfo = new myResumeModel(body);
    myResumeModel.findOne(function(err,data){
        if(err){res.json(err);return;}
        if(!data){
            myInfo.save(function(err,saved){
                if(err){res.json(err);return;}
                res.json(saved);
                return;
            });
        }else{
        myResumeModel.update({_id:data._id},{vardas: body.vardas,
                                             amzius: body.amzius,
                                             issilavinimas: body.issilavinimas,
                                             image: body.image,
                                             kita: body.kita,
                                            },function(err,updated){
                                                if(err){res.json(err);return;}
                                                res.json(updated);
                                            });
        }
    });
})
.get('/',function(req,res,next){
    myResumeModel.findOne(function(err,data){
        if(err){res.json(err);return;}
        console.log(data);
    res.json(data);
    });
});

module.exports = router;