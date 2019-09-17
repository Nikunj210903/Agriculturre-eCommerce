var mongoose = require('mongoose');

var Auction = mongoose.model('Auction', {

  crop_name:{
	type : String,
  },
  farmer_user_name:{
	type : String,
  },
  crop_id: {
    type: String,
  },
  crop_quantity:{
    type:String,
  },
  crop_expected_price :{
	  type : String,
  },
  start_time:{
    type : String,
  },
  start_date:{
    type : String,
  },
  end_time:{
    type : String,
  },
  end_date:{
    type : String,
  },
  Vendors:[{
	User_name:String,
	Price : String,
  }]
});








module.exports = {Auction};
