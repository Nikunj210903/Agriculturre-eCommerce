var mongoose = require('mongoose');
var Farmer = mongoose.model('Farmer', {
  Name: {
    type: String,
  },
  address: {
    type: String,
  },
  city: {
    type: String,
  },
  state:{
    type:String,
  },
  contact_no: {
    type: String,
  },
  country: {
    type: String,
  },
  user_name:{
	type:String,  
  },
  farm:{
	  type:String,
  },
  pass:{
	  type:String,
  },
  token:{
	  type:String,
  }
});


module.exports = {Farmer};