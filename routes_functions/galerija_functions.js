var fs = require ('fs-extra');
var async = require ('async');
var path = require('path');
var custom_paths = require('../routes/paths');


/**###############################################################################
 *   Search for index.jpg and description.txt files
 * ###############################################################################*/

  function getIndexPicture (folder_name,callback){
    async.waterfall([
        // Find all files in folder
        //********************************************************
        function(call){
          fs.readdir(custom_paths.public_images_folder+folder_name+'/', call);
        // find index.jpg
        //********************************************************
        },function(files,call){
          for(var x=0; x<=files.length; x++){
          var index = '';
                if(files[x] == 'index.jpg' || files[x] == 'index.JPG'){
                  index = files[x];
                  call(null, files, index);
                  return;          
                }
                if(x==files.length){
                  call(null, files, index);
                  return;          
                }
          }
          // find desciption.txt file
        //********************************************************
        },function(files, index, call){
          var desciption = null;
          for(var x=0; x<=files.length; x++){
              if( files[x] == 'description.txt'){
                desciption = files[x];
                call(null, index, desciption );
                return;
              }
              if(x==files.length){
                call(null, index, desciption);
                return;          
              }
          }
        // Read desciption.txt file
        //********************************************************
        },function(index, desciption, call){
          var desciption_text = null;
          if(desciption){
            fs.readFile(custom_paths.public_images_folder+folder_name+'/'+desciption,'utf8',function(err,data){
                  if(err){
                    callback(null);
                    return;
                  }
                  desciption_text = data;
                  call(null, index, desciption_text );
                  return;
                });
          }else
              call(null, index, desciption_text );
        }
        // Send  function callback
        //********************************************************
      ],function(err,index ,desciption){
          if(err){
            callback(err)
            return;
          }
            callback({index_img: index, description: desciption});
            return;
      });
      }

module.exports = {

/**###############################################################################
 * Returs images files array with .jpg or .JPG extensions, from specified folder
 * examlpe: [img1.jpg, img2.JPG, ...]
 * ###############################################################################*/

  load_album: function(album_name, callback){
	// fs='File System' nuskaito duota direktorija ir grazina du parametrus : error ir file_lis
	fs.readdir(custom_paths.public_images_folder+album_name,function(error, $files){
		// patikrina ar nuoskaitant direktorija neatsirado klaidu
		// jei atsirado album_list() funkcija grazinamas error array
			if(error){callback(error); return;}
			// cia bus saugomi tik failai
			var files_only=[];
			// fukcija iteraror() issivecia pati save tol kol negauna return komandos
			// kai gauna return, iskviecia sekancia kunkcija (0), kuri nutrukia funkcijos iterator()
			//  darba
			(function iterator(i){
				if(i>=$files.length){
					var photos=files_only;
					callback(null,photos);
					return;
				}
       // adds to files_only[] array, only files with .jpg || .JPG extensions
       //***************************************************************
				fs.stat(custom_paths.public_images_folder+album_name+"/"+$files[i],function(err, stats){
					if(err){callback(err); return;}
          var img_src =custom_paths.images_location+album_name+'/'+ $files[i];
					if(stats.isFile() && (path.extname($files[i])=='.jpg' || path.extname($files[i])=='.JPG')){
						files_only.push({img_name: $files[i], img_src: img_src,
                             album_name: album_name, sukurta: stats.birthtime,
                             size: stats.size }); 
				  	iterator(i+1);
          }else{
				  	iterator(i+1);
          }
				});
			})(0);// (0) - nutraukia programos darba;
		});
	},

/**###############################################################################
*  suranda visus failus ir folderius duotoje direktorijoje 
* ###############################################################################*/
  
	findFolders: function(folder_name, callback){
    fs.readdir(custom_paths.public_folder+folder_name, function(err, call){
      if(err) {callback(err); return;}
      callback(null,call);
    });
  },

/**###################################################################################
* Funcija patikrina ar duotame direktoriju array:folders nera failu. Grazina callback
* funkcija su dviem parametrais (error, data). Data parametre suagomi direktoriju
*  pavadnimai
*####################################################################################*/
  
	isFolder: function(folders,callback){
    var folder_arr=[]; // is param:folders, isaugo tik direktorijas,bet ne failus  
    (function iterator(i){
      if(i>=folders.length){
        callback(null,folder_arr);
        return;
      }       
          fs.stat(custom_paths.public_images_folder+folders[i], function(err,folder){
            if(err){callback(err); return }
            // patikrina ar tai direktorija/ If true - save to folder_arr
            if(folder.isDirectory()){
              var folder_obj = {folder_name: folders[i], birth_time: folder.birthtime};
              folder_arr.push(folder_obj);
              iterator(i+1);
            }else{ iterator(i+1)}
          });
        })(0);
      },

  /**###########################################################################
	 *  loops through folders array, find in specific folder picture with name
   *  index.jpg or index.JPG, and construct json object with folder info 
   * ###########################################################################*/

  folderLoop: function(folder_array, callback){
    var folder_info=[];
      (function iteraror(i){
            if(i>=folder_array.length){
              callback(null, folder_info);
              return;
            }
        getIndexPicture(folder_array[i].folder_name,function(data){
          var title = folder_array[i].folder_name.replace(/_/g, " ");
          var image_src;
          // set index image of folder
          //********************************************************
          if(data.index_img != '')
            image_src = custom_paths.images_location+folder_array[i].folder_name+'/'+data.index_img;
          else
            image_src='http://icons.iconarchive.com/icons/oxygen-icons.org/oxygen/256/Places-folder-red-icon.png';
          //  JSON witch be send to client 
          //********************************************************
          folder_info.push({folder : folder_array[i].folder_name,
                            image_src : image_src,
                            title : title,
                            sukurta : folder_array[i].birth_time,
                            description : data.description });
          iteraror(i+1);
        });
      })(0);
    }

}