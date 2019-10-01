var mongoose = require('mongoose');
var Crop = mongoose.model('Crop', {
  Name: {
    type: String,
  }
});

module.exports = {Crop};
