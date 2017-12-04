var express = require ('express');
var router  = express.Router();
var TableRowModel = require('../mongoDB/table-row-schema');
var async = require ('async');

/*#####################################################################
 * Finds table from database by group ID, and sends to client 
#####################################################################*/
router.get('/get-one/:id', function(req, res, next) {
    var group_id = req.params.id;
///*************************  FINDS ALL ROWS THAT BELONGS TO group_id ****** */
            TableRowModel.find({group_id: group_id},function(err,rows){
                if(err){ res.json(err); return;}
                res.json(rows);
            });  
}).post('/add-row/:user_id/:group_id',function(req,res,next){
/*#####################################################################
 * add row to table 
 #####################################################################*/
 var group_id = req.params.group_id;
 var user_id = req.params.user_id;
 new TableRowModel({group_id:group_id,
                    user_id: user_id}).save(function(err,data){
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
            search_name: x.name,
            price:    x.price,    
            type:     x.type,   
            iframeURL:  x.iframeURL,         
            iseiga:     x.iseiga,
            iseiga_type: x.iseiga_type,
            material_price: x.material_price,
            material_name: x.material_name,
        },function(err,data){
            if(err){res.json(err);return}
                iterator(i+1)
        })
    })(0);
}).put('/remove-row',function(req,res,next){
 /*#####################################################################
 * Updates existing table 
 #####################################################################*/
    var row_ids=  JSON.parse(req.body.data);
    TableRowModel.remove({_id:{$in:row_ids}},
                        function (err){
                            if(err){res.json(err);return;} 
                            res.json('deleted');
                        });

})
module.exports = router;
