var express = require ('express');
var router = express.Router();
var custom_paths = require('./paths');
var fs = require('fs-extra');
var async = require('async');

router.post('/',function(req,res,next){
var body = JSON.parse(req.body.data);
console.log(body);
async.waterfall([
    /***************************** READ DIRECTORY ************************** */
    function(call){
        fs.readdir(custom_paths.public_images_folder+body.folder, function(err,data){
            if(err) call(err);
            console.log('************** 1 ************');
            call(null,data);
        });
    /***************************** FIND INDEX PICTURE ************************** */
    },function(files,call){
        var counter = 0;
        var array_length = files.length;
        var index = null;
        for(counter; counter<=array_length; counter++){
            if(files[counter] == 'index.JPG'){
            console.log('************** 2 ************');
                index = files[counter];
                call(null, index);
                return;
            }
            if(index != null || counter==array_length){
            console.log('************** 3 ************');
                call(null, index);
                return;
            }
        }
    /***************************** REANAME OLD INDEX PICTURE ************************** */
    },function(index,call){
        if(index){
            console.log('************** 4 ************');
            fs.rename(custom_paths.public_images_folder+body.folder+'/'+index, 
                        custom_paths.public_images_folder+body.folder+'/'+Date.now()+'.JPG', function(err){
                            if(err){
            console.log('************** 5 ************');
                            call({error: err, mesage: 'cant rename old index.JPG'});
                            return;
                            } 
            console.log('************** 6 ************');
                            call(null,null);
                        });
        }else{
            console.log('************** 7 ************');
            call(null,null);
        }
    /***************************** ADD INDEX  ************************** */
    },function(par,call){
        fs.rename(custom_paths.public_images_folder+body.folder+'/'+body.index, 
                  custom_paths.public_images_folder+body.folder+'/index.JPG', function(err){
                      if(err){
            console.log('************** 8 ************');
                        call({error: err, mesage: 'cant add index.'});
                        return;
                      } 
            console.log('************** 9 ************');
                      call(null, null);
                  });
    }
],function(err,call){
    if(err){
            console.log('************** 10 ************');
        res.json({error: err});
        return;
    }
    console.log('this is error from end function: '+err);
    console.log('data from last function: '+call);
res.json({mesage: call});
});


});

module.exports = router;