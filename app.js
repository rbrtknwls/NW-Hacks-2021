/// IMPORTS AND PRE REQS
var express = require("express");
var path = require("path");
var fs = require("fs");
var atob = require("atob");
var Sent = require("sentiment");
var admin = require("firebase-admin");

// CONSTANTS AND API KEYS
const PORT = process.env.PORT || 3000;
let serviceAccount = require("./secret_shhhh.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://nw-hacks-1cba2-default-rtdb.firebaseio.com/",
});

// Instancate OBJECTS
var app = express();
var sent = new Sent();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var db = admin.database();
var userRef = db.ref("stats");

var options = {
  extras: {
    good: 1,
    amazing: 2,
    awesome: 3,
    fat: -4,
    stupid: -5,
    fuck: -5,
    shit: -4,
    like: 3,
    love: 5,
  },
};

app.use(express.static(__dirname + "/public"));

// PAGE BUILDING STUFF
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/index.html"));
});
app.get("/sign-in", function (req, res) {
  res.sendFile(path.join(__dirname + "/pages/auth.html"));
});
app.get("/profile", function (req, res) {
  res.sendFile(path.join(__dirname + "/pages/profile.html"));
});
app.get("/chat", function (req, res) {
  res.sendFile(path.join(__dirname + "/pages/chat.html"));
});
app.get("/dashboard", function (req, res) {
  res.sendFile(path.join(__dirname + "/pages/index3.html"));
});
app.get("/stats", function (req, res) {
  res.sendFile(path.join(__dirname + "/pages/stats.html"));
});
server.listen(PORT);
console.log("CHECKING PORT " + PORT);

// Replace with SQL Database Later
var users = {};
var pms = {};
var chatRoomQueue = [];

var roomCtr = 1;


io.on("connection", function (socket) {

  socket.on("createuser", function (profile, returnID) {
    try {
      if (profile.google_ID in users) {
        //Log in normally
        io.to(returnID).emit(
          "signin",
          "success",
          profile.google_ID,
          profile.name,
          profile.image,
          profile.email
        );
        console.log("Norm Log");
      } else {
        //Create new account
        var gid = profile.google_ID;
        users[gid] = profile;

        db.ref("stat/" + gid).set({
          total_messages: 0,
          total_intent: 0,
          total_chats: 0,
          total_stars: 0,
          total_groups: 0,
          time_spent: 0
        });
        db.ref("stat/" + gid + "/emotions").set({
          angry: 0,
          sad: 0,
          tired: 0,
          nervous: 0,
          happy: 0
        });

        io.to(returnID).emit(
          "signin",
          "success",
          profile.google_ID,
          profile.name,
          profile.image,
          profile.email
        );
        console.log("New Account");
      }
    } catch (err) {
      console.log(err);
      io.to(returnID).emit("signin", "failure", "No ID");
    }
  });

  socket.on("getInfo", function (id, sender) {
    io.to(sender).emit("postInfo", users[id]);
  });

  socket.on("getUsers", function (sender) {
    io.to(sender).emit("postUsers", users);
  });

  socket.on("get_positvity", function (G_ID, sender) {
    var urlRef = db.ref().child("stat/" + G_ID);

    var g_intent = 0;
    var g_mess = 0;

    urlRef.once("value", function (snapshot) {
      snapshot.forEach(function (child) {
        if (child.key == "total_intent") {
          g_intent = child.val();
        }

        if (child.key == "total_messages") {
          g_mess = child.val();
        }
      });
    });

    setTimeout(function () {

      val = ((g_intent+5)/g_mess)*10;
      io.to(sender).emit("buildpos", val);

    }, 2000);


  });

  socket.on("get_misc_stats", function (G_ID, sender) {
    var urlRef = db.ref().child("stat/" + G_ID +"/emotions");

    var g_angry = 0;
    var g_happy = 0;
    var g_nervous = 0;
    var g_sad = 0;
    var g_tired = 0;

    urlRef.once("value", function (snapshot) {
      snapshot.forEach(function (child) {
        if (child.key == "angry") {
          g_angry = child.val();
        }

        if (child.key == "happy") {
          g_happy = child.val();
        }

        if (child.key == "nervous") {
          g_nervous = child.val();
        }

        if (child.key == "sad") {
          g_sad = child.val();
        }

        if (child.key == "tired") {
          g_tired = child.val();
        }
      });
    });

    setTimeout(function () {

      io.to(sender).emit("buildemo", g_angry,g_happy,g_nervous,g_sad,g_tired);

    }, 2000);


  });

  socket.on("get_misc_stats", function (G_ID, sender) {
    var urlRef = db.ref().child("stat/" + G_ID);

    urlRef.once("value", function (snapshot) {
      snapshot.forEach(function (child) {
        if (child.key == "total_chats") {
            io.to(sender).emit("peoplehelped", child.val());
        }

        if (child.key == "total_stars") {
            io.to(sender).emit("starsgot", child.val());
        }

        if (child.key == "total_groups") {
            io.to(sender).emit("groupsjoined", child.val());
        }

        if (child.key == "time_spent") {
            io.to(sender).emit("timespent", child.val());
        }

      });
    });
  });

  socket.on("comparepartners", function (sender) {

    if (chatRoomQueue.length >= 2){
        pms[chatRoomQueue[0]] = chatRoomQueue[1];
        pms[chatRoomQueue[1]] = chatRoomQueue[0];

        chatRoomQueue.pop()
        chatRoomQueue.pop()

    }

    console.log(pms)
    if (chatRoomQueue.includes(sender)){
      console.log(chatRoomQueue);
      setTimeout(function () {
        io.to(sender).emit("checkforpartner", "spare");
      }, 2000);
    }


  });

  socket.on("lookingforroom", function (sender) {

    if (sender != undefined){
      console.log(chatRoomQueue);

      chatRoomQueue.push(sender);

      io.to(sender).emit("checkforpartner", "spare");
    }


  });

  socket.on("disconnect", function () {
    var index = chatRoomQueue.indexOf(socket.id);
    if (index !== -1) {
      chatRoomQueue.splice(index, 1);
    }
    var x = pms[socket.id];
    delete pms[socket.id];
    delete pms[x];
    console.log(x);
    console.log(socket.id);
    io.to(socket.id).emit("chat message", "PARTNER LEFT PLEASE REFRESH");
    io.to(x).emit("chat message", "PARTNER LEFT PLEASE REFRESH");
  });

  socket.on("joinRoom", function (socketId, username) {
    console.log(username + " joined room: " + chatRoomQueue[0]);
    socket.join(chatRoomQueue[0]);
    socket.room = chatRoomQueue[0];
    socket.username = username;
    var clientsInRoom = io.nsps["/"].adapter.rooms[chatRoomQueue[0]];
    var numClients =
      clientsInRoom === undefined
        ? 0
        : Object.keys(clientsInRoom.sockets).length;
    console.log(numClients + " clients in room: " + chatRoomQueue[0]);
    if (numClients === 2) {
      io.in(chatRoomQueue[0]).emit("matchFound");
      if (chatRoomQueue[0] < roomCtr) {
        chatRoomQueue.shift();
      } else {
        roomCtr += 1;
        chatRoomQueue.push(roomCtr);
        chatRoomQueue.shift();
      }
      io.in(socket.room).emit("chat message", username + " joined the chat!");
      console.log(chatRoomQueue);
    }
  });

  socket.on("chat message", function (msg, username, fireref, date) {
    //console.log("message: " + msg);

    updateUsers(fireref.toString(), msg, date);

    var words = sent.analyze(msg.toLowerCase(), options)["calculation"];

    var sendalert = false;

    for (var i = 0; i < words.length; i++) {
      for (var word in words[i]) {
        if (words[i].hasOwnProperty(word)) {
          if (words[i][word] <= -4) {
            sendalert = true;
            msg = msg.replace(word, "#".repeat(word.length));
          }
        }
      }
    }
    console.log(sendalert);

    io.in(socket.room).emit("chat message", username + ":" + msg);
  });
});

function NumClientsInRoom(namespace, room) {
  var clients = io.nsps[namespace].adapter.rooms[room];
  return Object.keys(clients).length;
}

// Updates the Firebase of a user given a message that they just sent
// REQ: GoogleID, Message
function updateUsers(G_ID, Mess, G_DAY) {
  var stats = sent.analyze(Mess.toLowerCase(), options);
  var comp = stats["comparative"] * 2;

  var urlRef = db.ref().child("stat/" + G_ID);
  urlRef.once("value", function (snapshot) {
    snapshot.forEach(function (child) {
      if (child.key == "total_intent") {
        urlRef.update({
          total_intent: comp + child.val(),
        });
      }

      if (child.key == "total_messages") {
        urlRef.update({
          total_messages: 1 + child.val(),
        });
      }
    });
  });

  var urlReffar = db.ref().child("stat/" + G_ID + "/" + G_DAY);
  urlReffar.once("value", function (snapshot) {
    snapshot.forEach(function (child) {
      if (child.key == "total_intent") {
        urlReffar.update({
          total_intent: comp + child.val(),
        });
      }

      if (child.key == "total_messages") {
        urlReffar.update({
          total_messages: 1 + child.val(),
        });
      }
    });
  });
}

// Given a google_ID will take the corrisponding number of messages and
// Sum of intent and will return if the person is acting too toxic:
// 1) SUM Intent over -200
// 2) (Intent+20 / Num Messages)*20 < 2
// Will change the score to 0.
// REQ: GoogleID, Message
function get_toxicity(G_ID) {
  var urlRef = db.ref().child("stat/" + G_ID);

  var g_intent = 0;
  var g_mess = 0;

  urlRef.once("value", function (snapshot) {
    snapshot.forEach(function (child) {
      if (child.key == "total_intent") {
        g_intent = child.val();
      }

      if (child.key == "total_messages") {
        g_mess = child.val();
      }
    });
  });

  setTimeout(function () {
    val = ((g_intent*3+5)/g_mess)*10


  }, 2000);
}
