var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({ group_id: String,
                          tableName: String,
                          tableHead: { darbo_pavadinimas: { type : String, default :'Darbo pavadinimas'},
                                       vnt_kaina:         { type : String, default :'vnt-kaina' },
                                       mato_vnt:          { type : String, default :"mato-vnt"},
                                       input:             { type : String, default : 'kiekis'},
                                       suma:              { type : String, default : 'suma'}
                                     },
                          tableBody: [
                                      {  
                                        darbo_pavadinimas: {type: String, default: 'no name'},
                                        vnt_kaina:         {type: Number, default:  0.00},
                                        mato_vnt:          {type: String, default: 'null'},
                                        input:             {type: String, default: '0'},
                                        suma:              {type: Number, default:  0.00},
                                        aprasymas:         {type: String, default: 'no aprasymas'},
                                        darboSuma:         {type: Number, default: 0}, 
                                        iseiga:            {type: Number, default: 0},
                                        materialCost:      {type: Number, default: 0},
                                        materialSuma:      {type: Number, default: 0}
                                    }
                                    ],
                          tableSuma: {type: Number, default: 0},
                          materialSuma: { type: Number, default : 0},
                          darboSuma: {type :Number, default: 0 }
             });

var SkaiciuokleModel = mongoose.model('table_structure', schema);

module.exports = SkaiciuokleModel;
