

var mongoose = require('mongoose');
var Vendor = mongoose.model('Vendor', {
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
  business_name:{
	  type:String,
  },
  business_description:{
	  type:String,
  },
  user_name:{
	  type:String,
  },
  pass:{
	  type:String,
  },
  token:
  {
	type:String,
  }
});

module.exports = {Vendor};
