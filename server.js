var hbs = require('hbs');
var express=require("express");
var path=require("path");
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
var ObjectId = require('mongodb').ObjectId;
var nodemailer = require('nodemailer');
var cookieParser = require('cookie-parser');
var {Auction} = require('./Auction');
var {Farmer} = require('./Farmer');
var {Vendor} = require('./Vendor');
var {Enrolled_table} = require('./Enrolled_table');
var {admin} = require('./admin');
var {Crop} = require('./Crop');
const fs = require('fs');


const publicPath = path.join(__dirname, 'views');


var app=express();
app.set('view engine', 'hbs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended:true
}));
app.use(bodyParser.json());
app.use(express.static(publicPath));


hbs.registerPartials(__dirname + '/views/partials')


mongoose.connect('mongodb://localhost:27017/Bazzar');







app.get("/",function(req,res){
  res.sendFile("views/login.html",{root:__dirname});
})





app.post("/check_login_credentials",function(req,res){
	if(req.body.btn=="0")
	{
		if(req.body.r == "0"){
			var token=jwt.sign({user_name:req.body.uname},"Bazar");
			const update={token:token};
			Farmer.findOneAndUpdate({ user_name:req.body.uname,pass:req.body.psw },update, function(err, user){
			console.log(err);
			if(user)
			{
      res.cookie('farmer_user_name',user.user_name);
				res.sendFile("views/farmer_dashboard.html",{root:__dirname});
		  }
		  else{
			  res.sendFile("views/login.html",{root:__dirname});
			}
		});
	}
	else{
		var token=jwt.sign({user_name:req.body.uname},"Bazar");
		const update={token:token};
		Vendor.findOneAndUpdate( { user_name:req.body.uname, pass:req.body.psw },update, function(err, user){
		console.log(user);
		if(user)
		 {
      res.cookie('vendor_user_name',user.user_name);
			res.sendFile("views/vendor_dashboard.html",{root:__dirname});
		  }else{
        res.sendFile("views/login.html",{root:__dirname});
		  }

	  });
  }
}
else if(req.body.btn=="1")
{
	res.sendFile("views/farmer_sign_up.html",{root:__dirname});
}
else{
	res.sendFile("views/vendor_sign_up.html",{root:__dirname});
}
});





app.post("/store_farmer_sign_up",function(req,res){
	var token=jwt.sign({user_name:req.body.uname},"Bazar");
    var farmer=new Farmer({
    Name:req.body.uname,
    address:req.body.add,
    city:req.body.city,
    state:req.body.state,
    country:req.body.cntry,
    contact_no:req.body.cn,
	farm:req.body.dis,
	pass:req.body.psw,
	user_name:req.body.anum,
	token:token
  });
 farmer.save();

        res.cookie('farmer_user_name',req.body.anum);
				res.sendFile("views/farmer_dashboard.html",{root:__dirname});
});


app.post("/send_farmer_auction_launch_page",function(req,res){
 Crop.find().then((doc)=>{
	const result = doc;
    var jsonData = '{"crop":' + JSON.stringify(result) + '}';

    var jsonObj = JSON.parse(jsonData);
    // stringify JSON Object
    var jsonContent = "crop = '[" + JSON.stringify(jsonObj) +"]'";

    fs.writeFile("views/crop.json", jsonContent, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
    });

    });
console.log("h")
console.log(req.body.farmer_id)
res.sendFile("views/farmer_auction_launch.html",{root:__dirname});
})




app.post("/farmer_auction_launch",function(req,res){
  console.log(req.cookies.farmer_user_name)
  var auction=new Auction({
  crop_name:req.body.crop_name,
	farmer_user_name:req.cookies.farmer_user_name,
  crop_name:req.body.crop_name,
  crop_quantity:req.body.crop_quantity,
	crop_expected_price:req.body.crop_expected_price,
  start_time:req.body.start_time,
  start_date:req.body.start_date,
  end_time:req.body.end_time,
  end_date:req.body.end_date
  });
  auction.save();
  console.log(auction);
  res.sendFile("views/farmer_auction_launch.html",{root:__dirname});
})






app.post("/send_farmer_auction_current_page",function(req,res){
 Auction.find().then((doc)=>{
	const result = doc.filter(docs => docs.farmer_name=="ramesh");
    var jsonData = '{"auction":' + JSON.stringify(result) + '}';
    // parse json
    var jsonObj = JSON.parse(jsonData);
    // stringify JSON Object
    var jsonContent = "auction = '[" + JSON.stringify(jsonObj) +"]'";
    fs.writeFile("views/farmer_current_auction.json", jsonContent, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
    });

    });
res.sendFile("views/farmer_auction_current.html",{root:__dirname});
})




app.post("/send_farmer_auction_result_page",function(req,res){

 Auction.find().then((doc)=>{
	const result = doc.filter(docs => docs.farmer_name=="ramesh");
    var jsonData = '{"auction":' + JSON.stringify(result) + '}';
    // parse json
    var jsonObj = JSON.parse(jsonData);
    // stringify JSON Object
    var jsonContent = "auction = '[" + JSON.stringify(jsonObj) +"]'";
    fs.writeFile("views/farmer_launched_auction.json", jsonContent, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
    });
    });
res.sendFile("views/farmer_auction_result.html",{root:__dirname});
})







app.get("/farmer_dashboard",function(req,res){
res.sendFile("views/farmer_dashboard.html",{root:__dirname});
})





app.post("/store_vendor_sign_up",function(req,res){
	var token=jwt.sign({user_name:req.body.uname},"Bazar");
    var vendor=new Vendor({
    Name:req.body.uname,
    address:req.body.add,
    city:req.body.city,
    state:req.body.state,
    country:req.body.cntry,
    contact_no:req.body.cn,
	business_name:req.body.bn,
	business_description:req.body.dis,
	pass:req.body.psw,
	user_name:req.body.anum,
	token:token
  });

  vendor.save();


        res.cookie('vendor_user_name',req.body.anum);
				res.sendFile("views/vendor_dashboard.html",{root:__dirname});

})





app.post("/send_vendor_auction_takepart",function(req,res){
Crop.find().then((doc)=>{
  	console.log(doc);
	const result = doc;
    var jsonData = '{"crop":' + JSON.stringify(result) + '}';
    // parse json
    var jsonObj = JSON.parse(jsonData);
    // stringify JSON Object
    var jsonContent = "crop = '[" + JSON.stringify(jsonObj) +"]'";

    fs.writeFile("views/crop.json", jsonContent, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
    });
    });
	console.log(req.body.tp);
	res.sendFile("views/vendor_auction_takepart.html",{root:__dirname});
})



var dic={}
//console.log("firs[t[[[[[[]]]]]]]")
console.log(dic)
app.post("/vendor_crop_select",function(req,res){
var name = req.body.crop_name;
  Auction.find({crop_name:name}).then((doc)=>{
  dic[req.cookies.vendor_user_name] = doc;
  var result=dic
  console.log(dic);

		var jsonData = '{"selected":' + JSON.stringify(result) + '}';
    //console.log(jsonData)
			var jsonObj = JSON.parse(jsonData);
      //console.log(jsonObj)
      //console.log(JSON.stringify(jsonObj))
			var jsonContent = "selected = '[" + JSON.stringify(jsonObj) +"]'";
			fs.writeFile("views/selected.json", jsonContent, 'utf8', function (err) {
				if (err) {
				console.log("An error occured while writing JSON Object to File.");
				return console.log(err);
			}
    });
    });
		//}
    console.log("error");

	res.sendFile("views/vendor_auction_takepart.html",{root:__dirname});
//});
});



var enrolled={}
app.post("/vendor_interested_auction",function(req,res){
var auction_id=req.body.auction_id;
var o_id=new ObjectId(auction_id);
var obj={
	"User_name":req.cookies.vendor_user_name,
	"Price":"0"
};
Auction.findOneAndUpdate({_id:o_id}, {$push: {Vendors:obj}},function(err,model){ console.log(err);
// x = enrolled[req.cookies.vendor_user_name];
// if(x == undefined)
// {
//   enrolled[req.cookies.vendor_user_name] = [model];
// }else{
//   enrolled[req.cookies.vendor_user_name].push(model);
// }
// console.log("dic")
// console.log(enrolled)
// var result = enrolled;
// var jsonData = '{"enrolled":' + JSON.stringify(result) + '}';
// // parse json
// var jsonObj = JSON.parse(jsonData);
// // stringify JSON Object
// var jsonContent = "enrolled = '[" + JSON.stringify(jsonObj) +"]'";
// fs.writeFile("views/enrolled.json", jsonContent, 'utf8', function (err) {
//   if (err) {
//   console.log("An error occured while writing JSON Object to File.");
//   return console.log(err);
// }
// });
});
res.sendFile("views/vendor_auction_takepart.html",{root:__dirname});
})




app.post("/send_vendor_auction_current",function(req,res){
res.sendFile("views/vendor_auction_current.html",{root:__dirname});
})













var dic_enrolled={}
//console.log("firs[t[[[[[[]]]]]]]")
console.log(dic_enrolled)
app.post("/vendor_crop_select_enrolled",function(req,res){
var name = req.body.crop_name;
  Auction.find( { $and : [ {crop_name:name} ,{ Vendors : { $elemMatch :{ User_name : req.cookies.vendor_user_name }}}]} ).then((doc)=>{

console.log(doc);
  dic_enrolled[req.cookies.vendor_user_name] = doc;
  var result=dic_enrolled
  console.log(dic_enrolled);

    console.log(jsonData)
    var jsonData = '{"enrolled":' + JSON.stringify(result) + '}';
			var jsonObj = JSON.parse(jsonData);
      //console.log(jsonObj)
      //console.log(JSON.stringify(jsonObj))
			var jsonContent = "enrolled = '[" + JSON.stringify(jsonObj) +"]'";
			fs.writeFile("views/enrolled.json", jsonContent, 'utf8', function (err) {
				if (err) {
				console.log("An error occured while writing JSON Object to File.");
				return console.log(err);
			}
    });
 });

	res.sendFile("views/vendor_auction_enrolled.html",{root:__dirname});
//});
});
















app.post("/send_vendor_auction_enrolled",function(req,res){
res.sendFile("views/vendor_auction_enrolled.html",{root:__dirname})
})











app.post("/send_vendor_auction_result",function(req,res){
res.sendFile("views/vendor_auction_result.html",{root:__dirname})
})





app.get("/vendor_dashboard",function(req,res){
res.sendFile("views/vendor_dashboard.html",{root:__dirname});
});





app.get("/logout",function(req,res){
if(req.body.user=="farmer"){
  res.clearCookie('farmer_user_name');
}
else {
res.clearCookie('vendor_user_name');
}
  res.sendFile("views/login.html",{root:__dirname});
})






app.listen(3000,()=>{
console.log("server is on at port 3000");
})
