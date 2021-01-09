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
const chat = require("./server-chat");
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

io.on("connection", (socket) => {
	chat.initChat(io, socket);
});
