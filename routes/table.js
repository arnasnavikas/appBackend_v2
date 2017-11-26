var express = require ('express');
var router  = express.Router();
var TableModel = require ('../mongoDB/table-schema');
var TableRowModel = require('../mongoDB/table-row-schema');
var async = require ('async');
var groupModel = require('../mongoDB/group-model')

/*#####################################################################
 * Finds table from database by group ID, and sends to client 
#####################################################################*/
router.get('/get-one/:id', function(req, res, next) {
    var group_id = req.params.id;
    var data = new Object;
    async.parallel([
        function(call){
///*************************  FINDS TABLE THAT BELONGS group_id ****** */
            TableModel.findOne({group_id: group_id },function(err,table){
                if(err){ call(err); return;}
                data['table'] = table;
                call(null,null);
            });
        },function(call){
///*************************  FINDS ALL ROWS THAT BELONGS TO group_id ****** */
            TableRowModel.find({group_id: group_id},function(err,rows){
                if(err){ call(err); return;}
                data['tableRows'] = rows
                call(null,null);
            });  
        }],function(err,call){
            if(err){ res.json(err); return;}
            res.json(data);
    });
}).
/*#####################################################################
* Finds all tables
*#####################################################################*/
get('/get-all',function(req,res,next){
        TableModel.find(function(err,data){
            if(err){ res.json(err); return;}
            res.json(data);
        });
/*#####################################################################
* Creates new table 
*#####################################################################*/
}).
post('/create',function(req, res,next){
    var body = JSON.parse(req.body.data);
    var table = new TableModel(body);
    var tableRow = new TableRowModel({group_id:body.group_id});
    async.parallel([
///*************************  CREATE TABLE **************************** */
      function(call){
        table.save(function(err,data){
            if(err){call(err);return;}
            call(null,data);
        });
    },function(call){
///*************************  CREATE ROW IN TABLE **************************** */
        tableRow.save(function(err,data){
            if(err){call(err);return;}
            call(null,data);
        })
    },function(call){
///*************************  ADD TABLE NAME IN GROUP MODEL **************************** */
        groupModel.update({_id:body.group_id},{table_name:body.name},function(err,data){
            if(err){call(err);return;}
            call(null,data);
        })
    }],function(err,call){
        if(err){res.json(err);return;}
        res.json({MESSAGE:'THIS FROM NEW TABLE',DATA:body});
    })
}).post('/add-row/:group_id',function(req,res,next){
/*#####################################################################
 * add row to table 
 #####################################################################*/
 var group_id = req.params.group_id;
 var tableRow = new TableRowModel({group_id:group_id});
 tableRow.save(function(err,data){
     if(err){call(err);return;}
     res.json(data);
    });
}).post('/save',function(req,res,next){
 /*#####################################################################
  * SAVE table 
  #####################################################################*/
    var data = JSON.parse(req.body.data);
    (function iterator(i){
        if(i >= data.length){
          res.json('save comlete');
          return;
        } 
        var x = data[i]
        console.log(x)
        TableRowModel.update({_id:x._id},{
            group_id: x.group_id,           
            name:     x.name,
            price:    x.price,    
            type:     x.type,   
            iframeURL:  x.iframeURL,         
            iseiga:     x.iseiga,
            material_price: x.material_price
        },function(err,data){
            if(err){res.json(err);return}
                iterator(i+1)
        })
    })(0);
}).put('/remove-row/:id',function(req,res,next){
 /*#####################################################################
 * Updates existing table 
 #####################################################################*/
    var row_id= req.params.id;
    TableRowModel.remove({_id:row_id},
                        function (err){
                            if(err){res.json(err);return;} 
                            res.json('deleted');
                        });
/*#####################################################################
* Deletes existing table 
#####################################################################*/
}).put('/delete', function(req,res,next){
    var tablesID = JSON.parse(req.body.data);
    TableModel.remove({_id:{$in:tablesID}},function(err,data){
        if(err){res.json(err);return;}
        res.json(data);
    });
});
module.exports = router;