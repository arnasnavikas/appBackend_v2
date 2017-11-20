/**######################################################
 *  paths for images loading 
 * ######################################################*/
var localhost = {
    private_images_folder   : '/home/arnas/nodeJS/my-app/backend/public/private_images/',
    public_folder   : 'C:/Users/Arnas Navikas/AppBackend/public',
    images_location : 'http://localhost:3000/',
    private_images_location  : 'http://localhost:3000/private_images/',
    ipAddress: null
};
var realServer = {
    private_images_folder   : '/home/deploy/my_site/AppBackend/public/private_images/',
    public_folder   : '/home/deploy/my_site/AppBackend/public/',
    images_location : 'http://46.101.120.14:3000/',
    private_images_location  : 'http://46.101.120.14:3000/private_images/',
    ipAddress: '46.101.120.14'
}
module.exports = localhost;