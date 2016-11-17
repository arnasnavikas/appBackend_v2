var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var async = require ('async');
var fs = require ('fs');
/* GET home page. */
router.get('/', function(req, res, next) {

  

function load_album(album_name, callback){
	// fs='File System' nuskaito duota direktorija ir grazina du parametrus : error ir file_lis
	fs.readdir('../public/images/'+album_name+'/',function(error, $files){
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
				fs.stat("../public/images/"+album_name+"/"+$files[i],function(err, stats){
					if(err){callback(err); return;}
					// patikrina ar failas kuri grazino stat funkcija yra aplankas
					if(stats.isFile())
						var img_src ='http://localhost:3000/images/'+album_name+'/'+ $files[i];
						files_only.push({img_name: $files[i], img_src: img_src, album_name: album_name}); 
				  	iterator(i+1);
				});
			})(0);// (0) - nutraukia programos darba;
		});
	}

  async.waterfall([
        function(call){
          var folder_name = req.baseUrl.substr(10);
          load_album(folder_name,function(err, result){
              if(err) call(err);
              call(null,result);
          });
        } 
      ],function(err,call){
        // jei paskutine funkcja is async.waterfall grazina klaida
          if(err) res.json({"err": err, "message":"error from selected_gallery.js file."});
        // jei paskutine funkcija grazina duomenis
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.json(call);
  });
});

module.exports = router;
