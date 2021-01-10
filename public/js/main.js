function setCookie(cname, cvalue) {
  var d = new Date();
  d.setTime(d.getTime() + 200000000);
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function authSucc(){
  location.replace("/dashboard");
}
function authFail(){
  location.replace("/");
}

function cookieCheck(){
  var cookies = document.cookie;
  cookies = cookies.split(";");
  for (var i = 0; i < cookies.length; i++){
    var key = cookies[i].split("=")[0];
    if (key.localeCompare(" userid") == 0){
      return(true);
    }
  }
  return(false);
}

function getUserId(){
  var cookies = document.cookie;
  var state = false;
  cookies = cookies.split(";");
  for (var i = 0; i < cookies.length; i++){
    var key = cookies[i].split("=")[0];
    var sotr = cookies[i].split("=")[1];
    if (key.localeCompare(" userid") == 0){
      return (sotr);
    }
  }
  return (false);
}

function createUserCard(name, email, id){
  console.log('yes');
  var newCol = document.createElement('div');
  newCol.className = "col";

  var newCard = document.createElement('div');
  newCard.className = "card";
  newCard.style.width = "100%";
  var row = document.createElement('div');
  row.className = "row no-gutters";

  var col1 = document.createElement('div');
  col1.className = "col-10";

  var newCardBody = document.createElement('div');
  newCardBody.className = 'card-body';

  var newCardTitle = document.createElement('h5');
  newCardTitle.className = 'card-title';
  var t = document.createTextNode(name);
  newCardTitle.appendChild(t);

  var newCardText = document.createElement('p');
  newCardText.className = 'card-text';
  t = document.createTextNode(email);
  newCardText.appendChild(t);


  var col2 = document.createElement('div');
  col2.className = "col-2 align-self-center";

  var newButton = document.createElement('a');
  newButton.className = 'btn btn-primary';
  newButton.style.width = "90%";
  newButton.style.padding = "10px";
  t = document.createTextNode("Chat");
  newButton.appendChild(t);

  newCardBody.appendChild(newCardTitle);
  newCardBody.appendChild(newCardText);
  col1.appendChild(newCardBody);
  col2.appendChild(newButton);

  row.appendChild(col1);
  row.appendChild(col2);

  newCard.appendChild(row);

  newCol.appendChild(newCard);

  document.getElementById(id).appendChild(newCol);

  return (false);
}
