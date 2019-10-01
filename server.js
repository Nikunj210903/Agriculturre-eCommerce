var hbs = require('hbs');
var http=require("http");
var express=require("express");
var path=require("path");
var socketIO=require("socket.io");
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
var ObjectId = require('mongodb').ObjectId;


var cookieParser = require('cookie-parser');
var {Auction} = require('./Auction');
var {Farmer} = require('./Farmer');
var {Vendor} = require('./Vendor');
var {Enrolled_table} = require('./Enrolled_table');
var {admin} = require('./admin');
var {Crop} = require('./Crop');
const fs = require('fs');
const port = process.env.PORT || 3000;


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



var server=http.createServer(app);
var io=socketIO(server);
io.on('connection',(socket)=>{
  console.log("new connected");

socket.on('disconnect',function(){

  console.log('disconnect');

})





socket.on('join',function(data){
  var dic=data.data
  var key=data.vendor
  if(dic[key]!=undefined)
  {
  dic[key].forEach(function(element){
  console.log(element._id)
socket.join(element._id)

})
}
console.log(socket);
})

  socket.on('bide_submit',function(data){
    console.log(data);
    var auction_id=data.auction_id;
    var o_id=new ObjectId(auction_id);
    Auction.findOneAndUpdate({ $and : [ {_id:o_id} ,
                                      { Vendors : { $elemMatch :{ User_name : data.vendor_user_name }}},
                                      { "result.Price" : {$lt: data.vendor_bid_price}  }]},{$set:{"Vendors.$.Price":data.vendor_bid_price, "result.User_name": data.vendor_user_name ,"result.Price":data.vendor_bid_price} },
                                      {new:true},function(err,model){
                                        if(model)
                                        {
    dic_vendor_current[data.vendor_user_name] = [model];

    var jsonData = '{"current_vendor":' + JSON.stringify(dic_vendor_current) + '}';
      var jsonObj = JSON.parse(jsonData);
      var jsonContent = "current_vendor = '[" + JSON.stringify(jsonObj) +"]'";
      fs.writeFile("views/current_vendor.json", jsonContent, 'utf8', function (err) {
        if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
      }
    });

    io.to(auction_id).emit('change',{
      price:data.vendor_bid_price,
      id:data.auction_id
    })
  }
    });
  });
})


function fun(){
  var date=new Date();
  d = parseInt(date.getDate());
  d = (d < 10?"0":"")+d;
  m = date.getMonth() + 1;
  m = (m < 10?"0":"")+m;
  y = date.getFullYear();
  temp_date = y+"-"+ m +"-"+ d;
  time = date.toLocaleString('en-US', { hour:'numeric',minute:'numeric', hour12: true});
if(parseInt(time[0])<10 && time[0]>-1)
{
  time="0"+time;
}
 Auction.updateMany({$and: [{start_date :{$eq: temp_date}}, {start_time : {$eq: time}}]} , {$set: {flag:'0'}},function(err,doc){
 });
 Auction.updateMany( { $and:[{end_date:{$eq: temp_date}}, {end_time:{$eq: time}}] }, {$set: {flag:'1'}},function(err,doc){
 });
}
setInterval(fun,10000);
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
 farmer.save(function(err){
if(err){
   console.log("error");
   res.cookie('farmer_exist',"yes");
    res.sendFile("views/farmer_sign_up.html",{root:__dirname});


 }
 else{
   res.cookie('farmer_user_name',req.body.anum);
   res.sendFile("views/farmer_dashboard.html",{root:__dirname});
 }
 });


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
  end_date:req.body.end_date,
  flag:"-1", //not started yet

  result:{User_name:"xyz",Price:"0"}
  });
  auction.save();
  console.log(auction);
  res.sendFile("views/farmer_auction_launch.html",{root:__dirname});
})






app.post("/send_farmer_auction_current_page",function(req,res){

res.sendFile("views/farmer_auction_current.html",{root:__dirname});
})












var dic_farmer_crop_sellect_current={}
//console.log("firs[t[[[[[[]]]]]]]")
console.log(dic_farmer_crop_sellect_current)
app.post("/farmer_crop_select_current",function(req,res){
var name = req.body.crop_name;
  Auction.find({crop_name:name,farmer_user_name:req.cookies.farmer_user_name,flag:"0"}).then((doc)=>{
    console.log(doc);
  dic_farmer_crop_sellect_current[req.cookies.farmer_user_name] = doc;
  var result=dic_farmer_crop_sellect_current
  console.log(dic_farmer_crop_sellect_current);

		var jsonData = '{"current_farmer":' + JSON.stringify(result) + '}';
    //console.log(jsonData)
			var jsonObj = JSON.parse(jsonData);
      //console.log(jsonObj)
      //console.log(JSON.stringify(jsonObj))
			var jsonContent = "current_farmer = '[" + JSON.stringify(jsonObj) +"]'";
			fs.writeFile("views/current_farmer.json", jsonContent, 'utf8', function (err) {
				if (err) {
				console.log("An error occured while writing JSON Object to File.");
				return console.log(err);
			}
    });
    });
		//}
    console.log("error");
	res.sendFile("views/farmer_auction_current.html",{root:__dirname});
//});
});







var dic_farmer_enrolled={}
//console.log("firs[t[[[[[[]]]]]]]")
console.log(dic_farmer_enrolled)
app.post("/farmer_crop_select_enrolled",function(req,res){
var name = req.body.crop_name;
  Auction.find( { $and : [ {$or:[{flag:"-1"},{flag:"0"}]},{crop_name:name},{farmer_user_name:req.cookies.farmer_user_name}]} ).then((doc)=>{
//Auction.find(  {$and:[{flag:"-1" }]}).then((doc)=>{
console.log(doc);
  dic_farmer_enrolled[req.cookies.farmer_user_name] = doc;
  var result=dic_farmer_enrolled
  console.log(dic_farmer_enrolled);

    console.log(jsonData)
    var jsonData = '{"farmer_enrolled":' + JSON.stringify(result) + '}';
			var jsonObj = JSON.parse(jsonData);
      //console.log(jsonObj)
      //console.log(JSON.stringify(jsonObj))
			var jsonContent = "farmer_enrolled = '[" + JSON.stringify(jsonObj) +"]'";
			fs.writeFile("views/farmer_enrolled.json", jsonContent, 'utf8', function (err) {
				if (err) {
				console.log("An error occured while writing JSON Object to File.");
				return console.log(err);
			}
    });
 });

	res.sendFile("views/farmer_auction_enrolled.html",{root:__dirname});
//});
});






app.post("/send_farmer_auction_enrolled_page",function(req,res){
res.sendFile("views/farmer_auction_enrolled.html",{root:__dirname});
})










var dic_farmer_result={}
//console.log("firs[t[[[[[[]]]]]]]")
console.log(dic_farmer_result)
app.post("/farmer_crop_select_result",function(req,res){
var name = req.body.crop_name;
  Auction.find({ $and : [ {flag:"1"},{crop_name:name} ,{ farmer_user_name : req.cookies.farmer_user_name}]}).sort({end_date:-1}).then((doc)=>{
//Auction.find(  {$and:[{flag:"-1" }]}).then((doc)=>{
console.log(doc);
  dic_farmer_result[req.cookies.farmer_user_name] = doc;
  var result=dic_farmer_result
  console.log(dic_farmer_result);

    console.log(jsonData)
    var jsonData = '{"farmer_result":' + JSON.stringify(result) + '}';
			var jsonObj = JSON.parse(jsonData);
      //console.log(jsonObj)
      //console.log(JSON.stringify(jsonObj))
			var jsonContent = "farmer_result = '[" + JSON.stringify(jsonObj) +"]'";
			fs.writeFile("views/farmer_result.json", jsonContent, 'utf8', function (err) {
				if (err) {
				console.log("An error occured while writing JSON Object to File.");
				return console.log(err);
			}
    });
 });

	res.sendFile("views/farmer_auction_result.html",{root:__dirname});
//});
});















app.post("/send_farmer_auction_result_page",function(req,res){
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

  vendor.save(function(err){
  if(err){
    console.log("error");
    res.cookie('vendor_exist',"yes");
     res.sendFile("views/vendor_sign_up.html",{root:__dirname});


  }
  else{
    res.cookie('vendor_user_name',req.body.anum);
    res.sendFile("views/vendor_dashboard.html",{root:__dirname});
  }
  });
  });





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
  "Price":"0",
  "isWinner":"0"
};
Auction.findOneAndUpdate({_id:o_id}, {$push: {Vendors:obj}},function(err,model){ console.log(err);

});
res.sendFile("views/vendor_auction_takepart.html",{root:__dirname});
})





app.post("/send_vendor_auction_current",function(req,res){
res.sendFile("views/vendor_auction_current.html",{root:__dirname});
})













var dic_vendor_current={}
//console.log("firs[t[[[[[[]]]]]]]")
console.log(dic_vendor_current)
app.post("/vendor_crop_select_current",function(req,res){
var name = req.body.crop_name;
  Auction.find({ $and : [ {flag:"0"},{crop_name:name} ,{ Vendors : { $elemMatch :{ User_name : req.cookies.vendor_user_name }}}]}).then((doc)=>{
  dic_vendor_current[req.cookies.vendor_user_name] = doc;
  var result=dic_vendor_current

		var jsonData = '{"current_vendor":' + JSON.stringify(result) + '}';
    //console.log(jsonData)
			var jsonObj = JSON.parse(jsonData);
      //console.log(jsonObj)
      //console.log(JSON.stringify(jsonObj))
			var jsonContent = "current_vendor = '[" + JSON.stringify(jsonObj) +"]'";
			fs.writeFile("views/current_vendor.json", jsonContent, 'utf8', function (err) {
				if (err) {
				console.log("An error occured while writing JSON Object to File.");
				return console.log(err);
			}
    });
    });
	res.sendFile("views/vendor_auction_current.html",{root:__dirname});
//});
});








app.post("/vendor_auction_bid_price",function(req,res){
  var auction_id=req.body.auction_id;
  var o_id=new ObjectId(auction_id);


  Auction.findOneAndUpdate({ $and : [ {_id:o_id} ,
                                    { Vendors : { $elemMatch :{ User_name : req.cookies.vendor_user_name }}},
                                    { "result.Price" : {$lt: req.body.vendor_bid_price}  }]},{$set:{"Vendors.$.Price":req.body.vendor_bid_price, "result.User_name": req.cookies.vendor_user_name ,"result.Price":req.body.vendor_bid_price} },
                                    {new:true},function(err,model){

dic_vendor_current[req.cookies.vendor_user_name] = [model];
  var jsonData = '{"current_vendor":' + JSON.stringify(dic_vendor_current) + '}';
  //console.log(jsonData)
    var jsonObj = JSON.parse(jsonData);
    //console.log(jsonObj)
    //console.log(JSON.stringify(jsonObj))
    var jsonContent = "current_vendor = '[" + JSON.stringify(jsonObj) +"]'";
    fs.writeFile("views/current_vendor.json", jsonContent, 'utf8', function (err) {
      if (err) {
      console.log("An error occured while writing JSON Object to File.");
      return console.log(err);
    }
  });
});
  res.sendFile("views/vendor_auction_current.html",{root:__dirname});
})









var dic_enrolled={}
//console.log("firs[t[[[[[[]]]]]]]")
console.log(dic_enrolled)
app.post("/vendor_crop_select_enrolled",function(req,res){
var name = req.body.crop_name;
  Auction.find( { $and : [ {$or:[{flag:"-1"},{flag:"0"}]},{crop_name:name} ,{ Vendors : { $elemMatch :{ User_name : req.cookies.vendor_user_name }}}]} ).then((doc)=>{
//Auction.find(  {$and:[{flag:"-1" }]}).then((doc)=>{
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














var dic_vendor_result={}
//console.log("firs[t[[[[[[]]]]]]]")
console.log(dic_vendor_result)
app.post("/vendor_crop_select_result",function(req,res){
var name = req.body.crop_name;
  Auction.find({ $and : [ {flag:"1"},{crop_name:name} ,{ Vendors : { $elemMatch :{ User_name : req.cookies.vendor_user_name }}}]}).then((doc)=>{
//Auction.find(  {$and:[{flag:"-1" }]}).then((doc)=>{
console.log(doc);
  dic_vendor_result[req.cookies.vendor_user_name] = doc;
  var result=dic_vendor_result
  console.log(dic_vendor_result);

    console.log(jsonData)
    var jsonData = '{"vendor_result":' + JSON.stringify(result) + '}';
			var jsonObj = JSON.parse(jsonData);
      //console.log(jsonObj)
      //console.log(JSON.stringify(jsonObj))
			var jsonContent = "vendor_result = '[" + JSON.stringify(jsonObj) +"]'";
			fs.writeFile("views/vendor_result.json", jsonContent, 'utf8', function (err) {
				if (err) {
				console.log("An error occured while writing JSON Object to File.");
				return console.log(err);
			}
    });
 });

	res.sendFile("views/vendor_auction_result.html",{root:__dirname});
//});
});















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


server.listen(port,()=>{
console.log("server is on at port 3000");
})
