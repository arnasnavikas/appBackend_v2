var express = require('express');
var router = express.Router();
var async = require ('async');
var skaiciuokle_schema = require('../mongoDB/skaiciuokle_shema');

/* GET home page. */
router.get('/', function(req, res, next) {

skaiciuokle_schema.find(function(err,data){
    res.setHeader('Access-Control-Allow-Origin','*');
    if(err) res.json({message: err});


    res.json(data);
});
        

}).post('/', function(req, res,next){
/**get data from client */
var data = req.body.data;

async.waterfall([
        function(call){
            var tableData = JSON.parse(data);
            var newTable = new skaiciuokle_schema(tableData);
            newTable.save(function(err){
               if(err) call(err);

               call(null,{message: 'Table was saved to database.'});
           });
        }
],function(err,call){
    res.setHeader('Access-Control-Allow-Origin','*');
    if(err) res.json({message: err});

     res.json({message: call});
 
});

});

module.exports = router;
