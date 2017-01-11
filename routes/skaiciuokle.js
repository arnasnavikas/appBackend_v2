var express         = require ('express');
var router          = express.Router();
var fs              = require ('fs-extra'); 
var async           = require ('async');
var custom_paths    = require ('./paths'); 
var stream          = require ('stream');
var multer          = require ('multer');
var skaiciuokleFunctions = require ('./skaiciuokle-functions');
var skaiciuokle_schema   = require ('../mongoDB/skaiciuokle_shema');
var upload = multer({
    inMemory: true
});
/*#####################################################################
 * Finds all tables from database, and sends to client 
 ######################################################################*/
router.get('/', function(req, res, next) {
    var _names = [];
     try{
        skaiciuokle_schema.find(function(err,data){
            if(err){
                res.json({error: err, message: 'Cand find tables in database.'});
                throw new Error;
            }
            else{
                for(var x=0; x<data.length; x++){
                   _names.push(data[x].tableName);
                }
                res.json({data:data, names: _names});
                return;
            }
        });
     }catch(e){
         res.json(e);
     }
        
/*#####################################################################
* Creates new table 
 ######################################################################*/
}).post('/:tableName', upload.any(), function(req, res,next){
    var folderName = req.params['tableName'];
     async.waterfall([
            function(call){
                if(req.files){
                 var fileName = req.files[0].originalname; 
                 var buffer   = req.files[0].buffer;
                    skaiciuokleFunctions.createFolder(folderName,fileName,buffer,function(data){
                        console.log(call);
                        call(null,data);
                    });
                }else
                    call(null,null);
            },function(message,call){
                if(!message){
                    var _data = JSON.parse(req.body.data);
                    console.log(_data);
                    var table = new skaiciuokle_schema(_data);
                    table.save(function(err,data){
                        if(err){
                            call({error: err, message:'cant save table to database.'});
                        }
                        call(null,{database: data, fyleSystem: message});
                    });
                }else
                 call(null,'picture saved');
            }
     ],function(err,call){
        if(err){
            res.json({message: err});
            return;
        }else
            res.json({message: call});
     });
    
/*#####################################################################
* Updates existing table 
 ######################################################################*/
}).put('/:id',function(req,res,next){
    var tableID= req.params.id;
    var tableObj = JSON.parse(req.body.data);
    var tableBody = tableObj.tableBody;
    var tableHead = tableObj.tableHead;
    var tableName = tableObj.tableName;

        async.waterfall([
            function(call){
                skaiciuokle_schema.update({_id : tableID}, { $set: { tableHead: tableHead , tableBody: tableBody, tableName: tableName}},
                function (err,data) {
                    if(err){
                        call({error:err, message:'table not udated.'});
                        return;
                    } 
                    call(null, {message: 'Tabe updated.', data: data} );
                }
            );
        }
        ],function(err,call){
            if(err){
                res.json({error: err, message: 'table not updated'});
                return;
            } 
            res.json({message:'Tabe updated successfully.'});
        });
/*#####################################################################
* Deletes existing table 
 ######################################################################*/
}).delete('/:id', function(req,res,next){
    var tableID = req.params.id;

    skaiciuokle_schema.find({_id: tableID}).remove(function(err,data){
        if(err){
            res.json({error:err, message: 'table not deleted'});
            return;
        }
        else
        res.json({message:'deleted', data:data});
    });
});

module.exports = router;
