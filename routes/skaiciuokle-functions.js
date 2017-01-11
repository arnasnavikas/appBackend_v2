var fs              = require ('fs-extra'); 
var async           = require ('async');
var custom_paths    = require ('./paths'); 
var stream          = require ('stream');

module.exports = {
/*#####################################################################
* CREATE FOLDER AND SAVES PICTURES IN THAT FOLEDER 
 ######################################################################*/
    createFolder : function(folderName,pictureName,buffer,call){
                    var folderPath = custom_paths.table_pictures_folder+folderName+'/';
                    var bufferStream = new stream.PassThrough();
                    bufferStream.end(new Buffer(buffer));
                    fs.mkdir(folderPath, function(err) {
                        if (err){
                            if(err.code === 'EEXIST'){
                                call({message:'Tokia galerija jau egzistuoja.'});
                                return;
                            }else 
                                call({error: err});
                                return;
                            }
                            var writeFile = fs.createWriteStream( folderPath + pictureName );
                            bufferStream.pipe(writeFile);
                            writeFile.on('close', function () { 
                                    call({message: "Picture writed successfuly"});
                                    return;
                            });
                            writeFile.on('error',function(err){
                                    call({error: err});
                            });
                        });
                    }
}