var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({ 
                          tableName: String,
                          tableHead: { darbo_pavadinimas: { type : String, default :'Darbo pavadinimas'},
                                       vnt_kaina:         { type : String, default :'vnt-kaina' },
                                       mato_vnt:          { type : String, default :"mato-vnt"},
                                       input:             { type : String, default : 'kiekis'},
                                       suma:              { type : String, default : 'suma'}
                                     },
                          tableBody: [
                                     {  darbo_pavadinimas: {type: String, required: true},
                                        vnt_kaina:         {type: Number, required: true},
                                        mato_vnt:          {type: String, required: true},
                                        input:             {type: String, default: '0'},
                                        suma:              {type: Number, required: true},
                                        
                                     }
                                    ],
                          tableSuma: {type: Number, default: '0'},
             });

var skaiciuokleSchema = mongoose.model('table_structure', schema);

module.exports = skaiciuokleSchema;
