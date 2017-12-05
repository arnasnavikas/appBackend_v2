var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({ name:      {type:String},     
                          forname:   {type:String},  
                          age:       {type:Number},      
                          images:    {type:Array,default:[null]},
                          folder_name:{type:String},
                          profesion: {type:String},
                          hobby:     {type:String},
                          status:    { type: Number, default : 2},
                          message:   { type: String},
                          date:      { type: Date},
                          days_left: { type: Number} 
             });

var MyTeamModel = mongoose.model('team_member', schema);

module.exports = MyTeamModel;