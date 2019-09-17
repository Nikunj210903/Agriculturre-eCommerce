var mongoose = require('mongoose');
var admin = mongoose.model('admin', {
  user_name: {
    type: String,
  },
  password: {
    type: String,
  },
  token: {
    type: String,
  },
});

module.exports = {admin};
