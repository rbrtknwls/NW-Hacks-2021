var socket = io({ transports: ["websocket"], upgrade: false });

var day = new Date().getDate();

var userid = getUserId();
var username = getUserName();
var emotion = getEmote();

var canmessage;

function sendstar() {
	if (canmessage) {
		document.getElementById("star").style = "color: orange";
		console.log("SEND");
		socket.emit("givestar", socket.id);
	}
}
function getUserId() {
	var cookies = document.cookie;
	var state = false;
	cookies = cookies.split(";");
	for (var i = 0; i < cookies.length; i++) {
		var key = cookies[i].split("=")[0];
		var sotr = cookies[i].split("=")[1];
		if (key.localeCompare(" userid") == 0) {
			return sotr;
		}
	}
	return false;
}

function getEmote() {
	var cookies = document.cookie;
	var state = false;
	cookies = cookies.split(";");
	for (var i = 0; i < cookies.length; i++) {
		var key = cookies[i].split("=")[0];
		var sotr = cookies[i].split("=")[1];
		if (key.localeCompare(" emotion") == 0) {
			return sotr;
		}
	}
	return false;
}

function getUserName() {
	var cookies = document.cookie;
	var state = false;
	cookies = cookies.split(";");
	for (var i = 0; i < cookies.length; i++) {
		var key = cookies[i].split("=")[0];
		var sotr = cookies[i].split("=")[1];
		if (key.localeCompare(" username") == 0) {
			return sotr;
		}
	}
	return false;
}

function getPFP() {
	var cookies = document.cookie;
	var state = false;
	cookies = cookies.split(";");
	for (var i = 0; i < cookies.length; i++) {
		var key = cookies[i].split("=")[0];
		var sotr = cookies[i].split("=")[1];
		if (key.localeCompare(" userimg") == 0) {
			return sotr;
		}
	}
	return false;
}

var form = document.getElementById("form");
var input = document.getElementById("input");

socket.on("connect", function() {
	var canmessage = false;
	console.log(socket.id);
	socket.emit("emocon", socket.id, userid, emotion);
});

socket.on("checkforpartner", function() {
	console.log(socket.id);
	console.log(emotion);
	socket.emit("comparepartners", socket.id, emotion);
});

socket.on("matchFound", function(emo) {
	canmessage = true;
	console.log(emo);
	var message = "Start chatting!";
	if (emo == 1) {
		message += " (You both are Tired)";
	}
	if (emo == 2) {
		message += " (You both are Sad)";
	}
	if (emo == 3) {
		message += " (You both are Angry)";
	}
	if (emo == 4) {
		message += " (You both are Nervous)";
	}
	if (emo == 5) {
		message += " (You both are Happy)";
	}
	document.getElementById("waiting-msg").innerHTML = message;
});

form.addEventListener("submit", function(e) {
	e.preventDefault();
	if (input.value && canmessage) {
		socket.emit("chat message", input.value, username, userid, day, socket.id);
		input.value = "";
	}
});

socket.on("chat message", function(msg, isender) {
	var item = document.createElement("li");
	var imgsrc = getPFP();
	if (isender == 0) {
		item.classList.add("mine");
	}
	else if (isender == 1) {
		item.classList.add("left");
	}
	item.textContent = msg;
	messages.appendChild(item);
	window.scrollTo(0, document.body.scrollHeight);
});

$(function() {
	$("form").on("submit", function(event) {
		event.preventDefault();
		var message = $(".message").first().clone();
		message.find("p").text($("input").val());
		message.prependTo("#messagebox");
		$("input").val("");
	});
});
