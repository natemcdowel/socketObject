
var express = require('express')
  , http = require('http')
  , app = express()
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

app.use(express.static(__dirname + '/'));
server.listen(3000, '0.0.0.0');

var serverLoopMilliseconds = 50
  , clientid = ''
  , users = Array()
  , socketObjects = []
  , playerObjects = []
  , i = 0;


/**
 * Server utility functions
 *
 *
 */
var checkGUID = function(object, destroy) {
  for(var i = 0; i < socketObjects.length; i++) {
    if (socketObjects[i].GUID == object.GUID) {
      return i;
    }
  }
  return false;
};

var checkAbstractObjectGUID = function(thisEntity, objectName) {
  for(var i = 0; i < objectName.length; i++) {
    if (objectName[i].GUID == thisEntity.GUID) {
      return i;
    }
  }
  return false;
};

// Update some socketObjects keys
var updateSocketObjectKeys = function(object, i) {
  for (key in object) {
    if (socketObjects[i]) {
      if (socketObjects[i][key] == true && key === 'dead'){
        return false;
      }
      else {
       socketObjects[i][key] = object[key];
      }
    }
  }
  return true;
};

var updatePlayerObjectKeys = function(object, i) {
  for (key in object) {
    if (playerObjects[i]) {
       playerObjects[i][key] = object[key];
    }
  }
  return true;
};


io.sockets.on('connection', function (socket) {

  // Creating player array
  socket.emit('assignid',i);
  i++

  // Enemy Data stored in server from Host client
  socket.on('updateobjects', function (objects) {
    socketObjects = objects;
  });

  // Updates an object sent from a slave client
  socket.on('slaveupdateobjects', function (object) {
    // Update socketObject Keys
    var i = checkGUID(object);
    if (i || i === 0) {
      updateSocketObjectKeys(object,i);
    }
    // Send updated object to host
    io.sockets.emit('updatehostobject', object);
  });

  // Adds an object sent from a slave client
  socket.on('slaveaddobject', function (object) {
    io.sockets.emit('addhostobject', object);
  });


  // playerObject socket functions
  socket.on('playersaddobject', function (object) {
    playerObjects.push(object);
  });

  socket.on('playersupdatedobject', function (object) {
    var i = checkAbstractObjectGUID(object, playerObjects);
    if (i || i === 0) {
      updatePlayerObjectKeys(object,i);
    }
  });

  // Updates player positions to client with serverLoopMilliseconds interval var
  // Main server loop
  setInterval(function(){
    io.sockets.emit('updateplayerobjects',playerObjects);
    io.sockets.emit('updateobjects',socketObjects);
  }, serverLoopMilliseconds);
});
