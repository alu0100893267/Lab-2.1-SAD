var net = require('net');
var zmq = require('zeromq');
var requester = zmq.socket('req');

exports.Start = function (host, port, cb) {
	/*requester.bind(host, function() {
    	console.log('Connected to: ' + host);
    	if (cb != null) cb();
	});*/
	requester.connect('tcp://localhost:9001');
}

var callbacks = {} // hash of callbacks. Key is invoId
var invoCounter = 0; // current invocation number is key to access "callbacks".

// When data comes from server. It is a reply from our previous request
// extract the reply, find the callback, and call it.
// Its useful to study "exports" functions before studying this one.

requester.on ('message', function (msg) {
	console.log("Recibi respuesta del server");
	//console.log ('Data comes in: ' + msg + "\n");
	var r = msg.toString().split("}{");

	for(var i = 0; i < r.length; i++){

		if (r.length > 1 ) {
			if (i != 0)
				r[i] = "{"+ r[i];

			if (i != r.length - 1)
				r[i] = r[i] + "}";
		}

		console.log('Parte ' + (i+1) + '/'+ r.length + ': \n' + r[i].toString() + "\n");
		var reply = JSON.parse (r[i].toString());
		switch (reply.what) {
			case 'get private message list':
			case 'get public message list':
			case 'get subject list':
			case 'get user list':
			case 'get subject':
			case 'add subject':
			case 'add user':
			case 'add private message':
			case 'add public message':
			case 'login':
				console.log ('We received a reply for: ' + reply.what + ' : ' + reply.invoId);
				callbacks [reply.invoId] (reply.obj); // call the stored callback, one argument
				delete callbacks [reply.invoId]; // remove from hash
				break;
			default:
				console.log ("Panic: we got this: " + reply.what);
		}
	}
});

requester.on('close', function() {
    console.log('Connection closed');
});

// on each invocation we store the command to execute (what) and the invocation Id (invoId)
// InvoId is used to execute the proper callback when reply comes back.

function Invo (str, cb) {
	this.what = str;
	this.invoId = ++invoCounter;
	callbacks[invoCounter] = cb;
}

// Exported functions as 'dm'


exports.getPublicMessageList = function  (sbj, cb) {
	var invo = new Invo ('get public message list', cb);
	invo.sbj = sbj;
	requester.send (JSON.stringify(invo));
	console.log("Petición de get public message list");
}


exports.getPrivateMessageList = function (u1, u2, cb) {
	var invo = new Invo ('get private message list', cb);
	invo.u1 = u1;
	invo.u2 = u2;
	requester.send (JSON.stringify(invo));
	console.log("Petición de get private message list");
}


exports.login = function (u, p, cb) {
	var invo = new Invo('login', cb);
	invo.u = u;
	invo.p = p;
	requester.send (JSON.stringify(invo));
	console.log("Petición de login");
}


exports.getSubjectList = function (cb) {
	requester.send (JSON.stringify(new Invo ('get subject list', cb)));
	console.log("Petición de get subject list");
}


exports.getUserList = function (cb) {
	requester.send (JSON.stringify(new Invo ('get user list', cb)));
	console.log("Petición de get user list");
}


exports.getSubject = function (sbj, cb) {
	var invo = new Invo ('get subject', cb);
	invo.sbj = sbj;
	requester.send (JSON.stringify(invo));
	console.log("Petición de get subject");
}


exports.addPrivateMessage = function(msg, cb) {
	var invo = new Invo ('add private message', cb);
	invo.msg = msg;
	requester.send (JSON.stringify (invo));
	console.log("Petición de add private message");
}

exports.addPublicMessage = function(msg, cb) {
	var invo = new Invo ('add public message', cb);
	invo.msg = msg;
	requester.send (JSON.stringify (invo));
	console.log("Petición de add public message");
}

exports.addSubject = function(sbj, cb) {
	var invo = new Invo ('add subject', cb);
	invo.sbj = sbj;
	requester.send (JSON.stringify (invo));
	console.log("Petición de add subject");
}

exports.addUser = function (u, p, cb) {
	var invo = new Invo ('add user', cb);
	invo.u = u;
	invo.p = p;
	requester.send (JSON.stringify (invo));
	console.log("Petición de add user");
}
