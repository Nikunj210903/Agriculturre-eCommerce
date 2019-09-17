var mongoose = require('mongoose');

var Query_data = mongoose.model('Query_data', {
  Name: {
    type: String,
  },
  contact_no: {
    type: String,
  },
  Query: {
    type: String,
  },
  Answer:{
    type:String,
  }
});

var query_data=new Query_data({
  Name:"nikunj",
  contact_no:"nikunj",
  Query:"nikunj",
  Answer:"Not answered"
});

console.log(query_data._id)
