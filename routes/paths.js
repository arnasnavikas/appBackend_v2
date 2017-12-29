/**######################################################
 *  paths for images loading 
 * ######################################################*/
var localhost = {
    public_folder   : 'C:/Users/Arnas/webProject/appBackend_v2/public',
    images_location : 'http://localhost:3000/',
    ipAddress: null,
};
var realServer = {
    public_folder   : '/home/arnas/appBackend_v2/public',
    images_location : 'http://139.59.134.47:3000/',
    ipAddress: null
}
var myLaptoop ={
    ipAddress: '192.168.1.67',
    images_location : 'http://192.168.1.67:3000/',
    public_folder   : 'C:/Users/Arnas/webProject/appBackend_v2/public',
}
module.exports = realServer;