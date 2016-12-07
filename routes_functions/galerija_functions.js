var fs = require ('fs-extra');

/**###############################################################################
 *   loop through files in given folder, return file with name index.jpg 
 * or index JPG
 * ###############################################################################*/

  function getIndexPicture (folder_name,callback){
      fs.readdir('/home/arnas/nodeJS/my-app/backend/public/images/'+folder_name+'/', function(err, files){
            if(err) {callback(err); return};
        (function iteraror(i){
          // if no index.jpg was found return null
            if(i>=files.length) {
              callback(null, null);
              return;
            }
            fs.stat('/home/arnas/nodeJS/my-app/backend/public/images/'+folder_name+'/'+files[i], function(err,file){
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

module.exports = {

/**###############################################################################
 * Returs files from specified folder
 * ###############################################################################*/

  load_album: function(album_name, callback){
	// fs='File System' nuskaito duota direktorija ir grazina du parametrus : error ir file_lis
	fs.readdir('/home/arnas/nodeJS/my-app/backend/public/images/'+album_name,function(error, $files){
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

				// fs stat pateikia informacijos apie nurodyta faila
				fs.stat("/home/arnas/nodeJS/my-app/backend/public/images/"+album_name+"/"+$files[i],function(err, stats){
					if(err){callback(err); return;}
          // patikrina ar failas kuri grazino stat funkcija yra aplankas
					if(stats.isFile()){
            // console.log(stats);
						var img_src ='http://localhost:3000/images/'+album_name+'/'+ $files[i];
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
    fs.readdir('/home/arnas/nodeJS/my-app/backend/public/'+folder_name, function(err, call){
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
          fs.stat('/home/arnas/nodeJS/my-app/backend/public/images/'+folders[i], function(err,folder){
            if(err){callback(err); return }
            // patikrina ar tai direktorija/ If true - save to folder_arr
            if(folder.isDirectory()){
              folder_arr.push(folders[i]);
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

}