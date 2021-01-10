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
