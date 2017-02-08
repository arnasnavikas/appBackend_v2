/**######################################################
 *  paths for images loading 
 * ######################################################*/
var localhost = {
    public_folder           : '/home/arnas/nodeJS/my-app/backend/public/',
    public_images_folder    : '/home/arnas/nodeJS/my-app/backend/public/images/',
    images_location         : 'http://localhost:3000/',
    table_images_location   : 'http://localhost:3000/tablePictures/',
    
};
var realServer = {
    public_folder           : '/home/deploy/my_site/AppBackend/public/',
    public_images_folder    : '/home/deploy/my_site/AppBackend/public/images/',
    images_location         : 'http://46.101.120.14/images/',
}
module.exports = localhost;