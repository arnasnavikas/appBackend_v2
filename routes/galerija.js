var express = require('express');
var router = express.Router();
var fs = require ('fs');
var path = require ( 'path');
var async = require ('async');
/* GET users listing. */
router.get('/', function(req, res, next) {

/**  loop through files in given folder, return file with name index.jpg or index JPG */
function getIndexPicture(folder_name,callback){
    fs.readdir('../public/images/'+folder_name+'/', function(err, files){
          if(err) {callback(err); return};
      (function iteraror(i){
        // if no index.jpg was found return null
          if(i>=files.length) {
            callback(null, null);
            return;
          }
          fs.stat('../public/images/'+folder_name+'/'+files[i], function(err,file){
            if(file.isFile() && files[i] =='index.jpg' || files[i] == 'index.JPG'){
              var index_picture=files[i];
              callback(null,index_picture);
              return;
            } 
            else iteraror(i+1);
          });
        })(0);
      });
    }

/** suranda visus failus ir folderius duotoje direktorijoje */
function findFolders(folder_name, callback){
  fs.readdir('../public/'+folder_name, function(err, call){
    if(err) {callback(err); return;}
    callback(null,call);
  });
}

/**Funcija patikrina ar duotame direktoriju array:folders nera failu. Grazina callback
 * funkcija su dviem parametrais (error, data). Data parametre suagomi direktoriju pavadnimai
 */
function isFolder(folders,callback){
  var folder_arr=[]; // is param:folders, isaugo tik direktorijas,bet ne failus  
  (function iterator(i){
    if(i>=folders.length){
      callback(null,folder_arr);
      return;
    }       
        fs.stat('../public/images/'+folders[i], function(err,folder){
          if(err){callback(err); return }
          // patikrina ar tai direktorija/ If true - save to folder_arr
          if(folder.isDirectory()){
            folder_arr.push(folders[i]);
            iterator(i+1);
          }else{ iterator(i+1)}
        });
      })(0);
    }

/** loops through folders array, find in specific folder picture with name
 *  index.jpg or index.JPG, and construct json object with folder info 
 * */

function folderLoop(folder_array, callback){
 var folder_info=[];
  (function iteraror(i){
    if(i>=folder_array.length){
      callback(null, folder_info);
      return;
    }
    getIndexPicture(folder_array[i],function(err, data){
      var title = folder_array[i].replace(/_/g, " ");
      var image_src;
      if(data){
        image_src = 'http://localhost:3000/images/'+folder_array[i]+'/'+data;
      }else{
        image_src='http://icons.iconarchive.com/icons/oxygen-icons.org/oxygen/256/Places-folder-red-icon.png';
      }
      folder_info.push({folder:folder_array[i], image_src:image_src, title: title});
      iteraror(i+1);
    });
  })(0);
}
// suranda visus failus nurodytame aplanke
findFolders('images',function(err,data){
  // patkrina ar rasti failai yra direktorijos
  isFolder(data, function(err,data){
    // sukonstruoja array ir issiuncia 
    folderLoop(data,function(err,data){
                    if(err) res.send(err) ;
                    res.setHeader("Access-Control-Allow-Origin", "*");
                    res.json( data);
    });
  });
});
                });

module.exports = router;
