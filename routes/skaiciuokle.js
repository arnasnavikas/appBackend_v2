var express = require ('express');
var router  = express.Router();
var skaiciuokle_schema = require ('../mongoDB/skaiciuokle_shema');
/*#####################################################################
 * Finds all tables from database by group ID, and sends to client 
*/
router.get('/:id', function(req, res, next) {
        skaiciuokle_schema.find({group_id: req.params.id},function(err,data){
            if(err){ res.json(err); return;}
            res.json(data);
        });
}).get('/',function(req,res,next){
        skaiciuokle_schema.find(function(err,data){
            if(err){ res.json(err); return;}
            res.json(data);
        });
/*#####################################################################
* Creates new table 
*/
}).post('/',function(req, res,next){
    var body = JSON.parse(req.body.data);
    var table = new skaiciuokle_schema(body);
    table.save(function(err,data){
        if(err){res.json(err);return;}
        res.json(data);
    });
/*#####################################################################
* Updates existing table 
*/
}).put('/:id',function(req,res,next){
    var tableID= req.params.id;
    var tableObj = JSON.parse(req.body.data);
    skaiciuokle_schema.update({_id:tableID},
                         {$set:{tableHead:tableObj.tableHead,
                                tableBody:tableObj.tableBody,
                                tableName:tableObj.tableName}},
                        function (err,data){
                            if(err){res.json(err);return;} 
                            res.json(data);
                        });
/*#####################################################################
* Deletes existing table 
*/
}).delete('/:id', function(req,res,next){
    var tableID = req.params.id;
    skaiciuokle_schema.find({_id: tableID}).remove(function(err,data){
        if(err){res.json(err);return;}
        res.json(data);
    });
});
module.exports = router;
