

var options = {
	extras: {
		good: 1,
		amazing: 2,
		awesome: 3,
		fat: -4,
		stupid: -2,
		fuck: -5,
		shit: -4,
		like: 3,
		love: 5
	}
};

var chatQueue = new Array();
var chatRoom = 1;

exports.initChat = (io, socket) => {
	console.log("a user connected!");

	socket.on("disconnect", function() {
		console.log(socket.id + " got disconnected!");
		var i = chatQueue.indexOf(socket);
		chatQueue.splice(i, 1);
		console.log(chatQueue);
		io.in(socket.room).emit("chat message", socket.id + " has left the chat.");
	});

	socket.on("joinRoom", function(socketId) {
		chatQueue.push(socketId);
		socket.join(chatRoom);
		socket.room = chatRoom;
		console.log(chatQueue);
		if (chatQueue.length === 2) {
			io.in(chatRoom).emit("matchFound", { msg: "hello world" });
			chatQueue = [];
			chatRoom += 1;
			console.log(socket.room);
			// console.log(chatQueue);
			// console.log(chatRoom);
		}
	});

	socket.on("chat message", function(msg) {
		//console.log("message: " + msg);
		io.in(socket.room).emit("chat message", msg);
	});
};

// Updates the Firebase of a user given a message that they just sent
// REQ: GoogleID, Message

function updateUsers (G_ID, Mess){
  var urlRef = db.ref().child("stat/" +G_ID);

  var stats = sent.analyze(Mess.toLowerCase(), options);
  var comp = stats["comparative"] * 2;
  var num_mess = 1;


  urlRef.once("value", function(snapshot) {
    snapshot.forEach(function(child) {

      if (child.key == "total_intent"){
        comp += child.val();
        db.ref().child("stat/" +G_ID).update({
          "total_intent": comp
        })
      };

      if (child.key == "total_messages"){
        num_mess += child.val();
        db.ref().child("stat/" +G_ID).update({
          "total_messages": num_mess
        })
      };

    });
  });

}
