var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({ group_id:             String,
                          name:                 {type: String, default: ''},
                          price:                {type: Number, default:  0.00},
                          type:                 {type: String, default: 'null'},
                          input:                {type: Number, default: 0},
                          iframeURL:            {type: String, default: ''},
                          iseiga:               {type: Number, default: 0},
                          hidden:               {type: Boolean, default: true},
                          material_price:       {type: Number, default: 0},
                          job_total_price:      {type: Number, default: 0}, 
                          material_total_price: {type: Number, default: 0},
                          total_price:          {type: Number, default:  0.00}
             });

var TableRowModel = mongoose.model('table-row', schema);

module.exports = TableRowModel;
