var mongoose = require('mongoose');

var Enrolled_table = mongoose.model('Enrolled_table', {

  vendor_user_name:{
	type : String,
  },
  auction_id:{
	type : String,
  }
});








module.exports = {Enrolled_table};
