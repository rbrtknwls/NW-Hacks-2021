var socket = io({ transports: ["websocket"], upgrade: false });

var form = document.getElementById("form");
var input = document.getElementById("input");

socket.on("connect", function() {
	console.log(socket.id);
	socket.emit("joinRoom", socket.id);
});

socket.on("matchFound", function() {
	document.getElementById("waiting-msg").innerHTML = "Start chatting!";
});

form.addEventListener("submit", function(e) {
	e.preventDefault();
	if (input.value) {
		socket.emit("chat message", input.value);
		input.value = "";
	}
});

socket.on("chat message", function(msg) {
	var item = document.createElement("li");
	item.textContent = msg;
	messages.appendChild(item);
	window.scrollTo(0, document.body.scrollHeight);
});
