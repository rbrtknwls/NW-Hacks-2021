/// IMPORTS AND PRE REQS
var express = require('express');
var path = require('path');
var fs = require('fs');
var atob = require('atob')
var Sent = require('sentiment');
var admin = require("firebase-admin");

// CONSTANTS AND API KEYS
const PORT = process.env.PORT || 3000;
let serviceAccount = require('./secret_shhhh.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://nw-hacks-1cba2-default-rtdb.firebaseio.com/'
});



// Instancate OBJECTS
var app = express();
var sent = new Sent();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var db = admin.database();
var userRef = db.ref("stats");


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

userRef.set({
  alanisawesome: {
    date_of_birth: "June 23, 1912",
    full_name: "Alan Turing"
  },
  gracehop: {
    date_of_birth: "December 9, 1906",
    full_name: "Grace Hopper"
  }
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
        var gid = profile.google_ID;
        users[gid] = profile;

        db.ref("stats/" + gid).set({
          total_messages: 0,
          total_intent: 0,
          time_spent: 0
        });

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
