var express = require('express');
var router = express.Router();
var async = require ('async');

/* GET home page. */
router.post('/', function(req, res, next) {
var loginData = req.body.data;
var jsonData=JSON.parse(loginData); 

  if(jsonData.name == 'Arnas' && jsonData.password=='password'){
    res.json({login:'success', valid:true});
  }else{
    res.json({login:'failed', valid:false});
  }

});

module.exports = router;
