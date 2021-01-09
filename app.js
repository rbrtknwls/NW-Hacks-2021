/// IMPORTS AND PRE REQS
var express = require('express');
var AWS = require('aws-sdk')
var path = require('path');
var fs = require('fs');
var atob = require('atob')
var im = require('imagemagick');

// CONSTANTS AND API KEYS
const PORT = process.env.PORT || 3000;
const config = {
    accessKeyId: "",
    secretAccessKey: "",
    region: "us-east-2"


};

// Instancate OBJECTS
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);


app.use(express.static(__dirname + '/public'));

// PAGE BUILDING STUFF
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
})
app.get('/sign-in', function (req, res) {
  res.sendFile(path.join(__dirname + '/pages/auth.html'));
});
app.get('/profile', function (req, res) {
  res.sendFile(path.join(__dirname + '/pages/profile.html'));
});
app.get('/chat', function (req, res) {
  res.sendFile(path.join(__dirname + '/pages/chat.html'));
});
app.get('/dashboard', function (req, res) {
  res.sendFile(path.join(__dirname + '/pages/dash.html'));
});





server.listen(PORT);
console.log("CHECKING PORT " + PORT)

// Replace with SQL Database Later
var users = {};
io.on('connection', function(socket){


  socket.on('createuser', function(profile,returnID){

    console.log(users);
    try {
      if (profile.google_ID in users){
        //Log in normally
        io.to(returnID).emit('signin', 'success', profile.google_ID);
        console.log("Norm Log");
      }else{
        //Create new account
        users[profile.google_ID] = profile;

        io.to(returnID).emit('signin', 'success', profile.google_ID);
        console.log("New Account");

      }

    }catch (err){
      console.log(err);
      io.to(returnID).emit('signin', 'failure', "No ID");
    }


  });

  socket.on('getInfo', function(id, sender){
    console.log(id);
    io.to(sender).emit('postInfo', users[id]);
  });

  socket.on('getUsers', function(sender){
    console.log("Returned Users");
    io.to(sender).emit('postUsers', users);
  });


  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
    console.log(msg);
  });

});
