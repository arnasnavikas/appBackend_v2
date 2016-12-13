var express = require('express');
var router = express.Router();
var async = require ('async');
var skaiciuokle_schema = require('../mongoDB/skaiciuokle_shema');

/*#####################################################################
 * Finds all tables from database, and sends to client 
 ######################################################################*/
router.get('/', function(req, res, next) {

skaiciuokle_schema.find(function(err,data){
    if(err) 
        res.json({message: err});
    else
        res.json(data);
});
        
/*#####################################################################
* Creates new table 
 ######################################################################*/
}).post('/', function(req, res,next){
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
    if(err)
        res.json({message: err});
    else
        res.json({message: call});
 
});
/*#####################################################################
* Updates existing table 
 ######################################################################*/
}).post('/:id',function(req,res,next){
    var tableID= req.params.id;
    var tableObj = JSON.parse(req.body.data);
    var tableBody = tableObj.tableBody;
    var tableHead = tableObj.tableHead;
    var tableName = tableObj.tableName;

        async.waterfall([
            function(call){
                skaiciuokle_schema.update({_id : tableID}, { $set: { tableHead: tableHead , tableBody: tableBody, tableName: tableName}},
                function (err,clb) {
                    if(err) call(err);

                    call(null, {message: 'Tabe updated.', callback: clb} );
                }
            );
        }
        ],function(err,call){
            if(err) res.json({error: err, message: 'table not updated'});

            res.json({message:'Tabe updated successfully.'});
        });
/*#####################################################################
* Deletes existing table 
 ######################################################################*/
}).delete('/:id', function(req,res,next){
    var tableID = req.params.id;

    skaiciuokle_schema.find({_id: tableID}).remove(function(err){
        if(err) 
            res.json({error:err, message: 'table not deleted'});
        else
        res.json({message:'deleted'});
    });
});

module.exports = router;
