// node dmclient <ipdmserver> <puertodmserver> orden

var dm = require ('./dm_remote.js');

var HOST = '127.0.0.1';
var PORT = 9000;

function Message (msg, from, to, isPrivate, ts) {
    this.msg=msg; this.from=from; this.isPrivate=isPrivate; this.to=to; this.ts=ts;
}


var array_comandos = [];
var it = 0;

// Pedimos el puerto por línea de comando

process.argv.forEach((val, index) => {

  if (process.argv.length > 3){
    if (index == 2) {
      HOST = val;
    }
    else if (index == 3) {
      PORT = val;
    }
    else if (index > 3) {
      array_comandos.push(val);
    }
  }

  else {
    console.log ("Introduzca con el siguiento formato: node dmclient <ip> <port> cmd");
  }
});


console.log (array_comandos);


dm.Start(HOST, PORT, function () {

  switch (array_comandos[it]) {

    case 'login':
      dm.login (array_comandos[++it], array_comandos[++it], function(ml) {
        console.log (JSON.stringify (ml))
      });

    break;


    case 'add user':
      dm.addUser (array_comandos[++it], array_comandos[++it], function (ml) {
        console.log (JSON.stringify (ml))
      });

    break;


    case 'add subject':
      dm.addSubject (array_comandos[++it], function (ml) {
        console.log (JSON.stringify (ml))
      });

    break;


    case 'get user list':
      dm.getUserList (function (ml) {
        console.log ("Lista de usuarios: ")
        console.log (JSON.stringify (ml))
        console.log ("");

      });

      it++;
    break;


    case 'get subject':
      dm.getSubject (array_comandos[++it], function (ml) {
        console.log (JSON.stringify (ml))
      });

    break;


    case 'get subject list':
      dm.getSubjectList (function (ml) {
          console.log (JSON.stringify (ml))
      });
    break;


    case 'get private message list':
      dm.getPrivateMessageList (array_comandos[++it], array_comandos[++it], function (ml){
        console.log (JSON.stringify (ml))
      });

    break;

    // Cambiar de id2 al nombre del subject
    case 'get public message list':
      dm.getPublicMessageList (array_comandos[++it],function (ml){
        console.log (JSON.stringify (ml))
      });

    break;


    case 'add private message':
      var msg = new Message (array_comandos[++it], array_comandos[++it], array_comandos[++it], true, new Date());

      dm.addPrivateMessage(msg, function (ml) {
        JSON.stringify (ml)
      });
    break;


    // Tratar mensajes de length > 2 && lo del subject id2
    case 'add public message':
      var msg = new Message (array_comandos[++it]);
      msg.to = array_comandos[++it];
      msg.from = array_comandos[++it];
      msg.ts = new Date();

      dm.addPublicMessage(msg, function (ml) {
        JSON.stringify (ml)
      });

    break;

    default:
      console.log("Introduce una opción correcta nano.");
  }
});
