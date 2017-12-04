var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({ group_id:             String,
                          user_id:              String,
                          name:                 {type: String, default: ''},
                          search_name:          {type:String, default:''},
                          type:                 {type: String, default: 'null'},
                          price:                {type: Number, default:  0.00},
                          input:                {type: Number, default: 0},
                          iframeURL:            {type: String, default: ''},
                          iseiga:               {type: Number, default: 0},
                          iseiga_type:          {type: String, default: 'null'},
                          hidden:               {type: Boolean, default: true},
                          material_price:       {type: Number, default: 0},
                          material_name:        {type: String, default: ''},
                          job_total_price:      {type: Number, default: 0}, 
                          material_total_price: {type: Number, default: 0},
                          total_price:          {type: Number, default:  0.00}
             });

var TableRowModel = mongoose.model('table-row', schema);

module.exports = TableRowModel;
