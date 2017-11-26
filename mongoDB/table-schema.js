var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({ group_id: String,
                          name:     String,
                          head: {      name:          { type : String, default :'Darbo pavadinimas'},
                                       job_price:     { type : String, default :'vnt/eur' },
                                       value:         { type : String, default :'Kiekis'},
                                       material_price:{ type : String, default :'Medžiagų kaina'},
                                       iseiga:        { type : String, default :'Išeiga'},
                                       total:         { type : String, default :'Suma'},
                                       iframeURL:     { type : String, default :'Iframe URL'}
                                     },
                          total:          {type: Number, default: 0},
                          material_total: {type: Number, default : 0},
                          work_total:     {type :Number, default: 0 }
             });

var TableModel = mongoose.model('table', schema);

module.exports = TableModel;
