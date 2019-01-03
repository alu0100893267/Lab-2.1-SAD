// node dmserver <puerto>

var net = require('net');
var numPort = '';

var dm = require ('./dm.js');

var zmq = require('zeromq');
var responder = zmq.socket('rep');
var publisher = zmq.socket('pub');

// Pedimos el puerto por línea de comando
process.argv.forEach((val, index) => {

  if (process.argv.length == 3){
    if (index == 2) {
      numPort = val;
      numPort = 'tcp://*:' + numPort;
    }
  }
  else {
    console.log ("Introduzca un puerto pls.");
    process.exit(1);
  }
});

responder.on('message', function(msg) {
  console.log('\nReceived request:', msg.toString());
  var str = msg.toString();
  var invo = JSON.parse (str);
  console.log('Request is: ' + invo.what);

  var reply = { what: invo.what, invoId: invo.invoId };

  switch (invo.what) {
    case 'get subject list':
      reply.obj = dm.getSubjectList();
      responder.send (JSON.stringify(reply));
      console.log("Respondo a la peticion que me llega de get subject list");
    break;

    case 'get public message list':
      reply.obj = dm.getPublicMessageList (invo.sbj);
      responder.send (JSON.stringify(reply));
      console.log("Respondo a la peticion que me llega de get public message list");
    break;

    case 'get private message list':
      reply.obj = dm.getPrivateMessageList (invo.u1, invo.u2);
      responder.send (JSON.stringify(reply));
      console.log("Respondo a la peticion que me llega de get private message list");
    break;

    case 'get user list':
      reply.obj = dm.getUserList();
      responder.send (JSON.stringify(reply));
      console.log("Respondo a la peticion que me llega de get user list");
    break;

    case 'get subject':
      reply.obj = dm.getSubject (invo.sbj);
      responder.send (JSON.stringify(reply));
      console.log("Respondo a la peticion que me llega de get subject");
    break;

    case 'add public message':
      reply.obj = dm.addPublicMessage (invo.msg);
      responder.send (JSON.stringify(reply));
      publisher.send(["A", JSON.stringify(reply)]);
      console.log("Respondo a la peticion que me llega de add public message");
    break;

    case 'add private message':
      reply.obj = dm.addPrivateMessage (invo.msg);
      responder.send (JSON.stringify(reply));
      console.log("Respondo a la peticion que me llega de add private message");
    break;

    case 'add subject':
      reply.obj = dm.addSubject (invo.sbj);
      responder.send (JSON.stringify(reply));
      console.log("Respondo a la peticion que me llega de add subject");
    break;

    case 'add user':
      reply.obj = dm.addUser (invo.u, invo.p);
      responder.send (JSON.stringify(reply));
      console.log("Respondo a la peticion que me llega de add user");
    break;

    case 'login':
      reply.obj = dm.login (invo.u, invo.p);
      responder.send (JSON.stringify(reply));
      console.log("Respondo a la peticion que me llega de login");
    break;

  }

});

responder.on('close', function(data) {
    console.log('Connection closed');
});


responder.bind('tcp://*:9001', function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log("Listening on tcp://*:9001\n");
  }
});

publisher.bind(numPort , function(err) {
  if(err)
    console.log(err)
  else
    console.log('Listening on ' + numPort + '\n')
});
