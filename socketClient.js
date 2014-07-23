/**
 * Socket client main loop
 *
 *
 */

var socketHost = location.href
		, socket = io.connect(socketHost)
		, clientLoopMilliseconds = 50
		, socketObjects = []
		, playerObjects = []
		, tickedSocketObjects = []
		, numberOfSavedTicks = 6
		, enemyZ = 100
		, hostObject = {}
		, host = 0;

/**
 * Socket listeners (These relay messages back to server.js)
 *
 *
 */

// Assigns unique clientid to browser
socket.on('assignid', function (id) {
	clientid = id;
});

// Updates ALL socketObjects with each server loop iteration
socket.on('updateobjects', function (objects) {
	if (objects.length > 0 && clientid != host) {
		socketObjects = objects;

		// Push to a timestamped array of socketObject snapshots
		if (tickedSocketObjects.length <= numberOfSavedTicks) {
			tickedSocketObjects.push(socketObjects);
		}
		else {
			tickedSocketObjects.push(socketObjects);
			tickedSocketObjects.splice(0,1);
		}
	}
});

// Updates player objects fo all clients
socket.on('updateplayerobjects', function (objects) {
	if (objects.length > 0) {
		playerObjects = objects;
	}
});

// Updates Host object directly
socket.on('updatehostobject', function (serverObject) {
	if (clientid == host) {
		// !!! Game Engine Logic !!! //
		var hostObject = me.game.editEntityByGUID(serverObject.GUID, serverObject);
	}
});

// Adds object passed from slave to host client
socket.on('addhostobject', function(serverObject) {
	if (clientid == host) {
		// Is the object already in the game?
		var foundHostObj = false;
		if (me.game.getEntityByGUID(serverObject.GUID) !== null) {
			foundHostObj = true;
		}

		// If the object has not been added to non-host client
		if (foundHostObj == false && serverObject.settings.entityName) {
			addObjectToClient(serverObject);
		}
	}
});


/**
 * Helper functions
 *
 *
 */
 // Passing input from browser to socket.io server
var socketResponse = function(type, data) {
	var socket = io.connect(socketHost);
 	socket.emit(type, data);
};

// Updates some socketObjects keys
var updateSocketObjectKeys = function(object, i) {
  for (key in object) {
    if (socketObjects[i][key]) {
      socketObjects[i][key] = object[key];
    }
  }
  return true;
};

// Updates some Entity keys
var updateHostEntityKeys = function(serverObject) {
	for (key in serverObject) {
    if (hostObject) {
      hostObject[key] = serverObject[key];
    }
  }
  return true;
};

// Find socket object index
var checkGUID = function(thisEntity) {
	for(var i = 0; i < socketObjects.length; i++) {
 		if (socketObjects[i].GUID == thisEntity.GUID) {
 			return i;
 		}
 	}
 	return false;
};

var addObjectToClient = function(serverObject) {
	var hostedEntity = new window[serverObject.settings.entityName](
			serverObject.pos.x,
			serverObject.pos.y,
			{
				image: serverObject.settings.image,
				spritewidth: serverObject.settings.spritewidth,
				spriteheight: serverObject.settings.spriteheight,
				GUID: serverObject.GUID
			}
	);
 	me.game.add(hostedEntity, enemyZ++);
	me.game.sort();
};

/**
 * Main client loop for updating engine objects from array of 'socketObjects'
 *
 *
 */
var initClientLoop = function(){

	// Useful for logging out objects for debug
	// setInterval(function(){
	// 	console.log(socketObjects);
	// },2500);

	setInterval(function(){

		// Player Loop for all clients
		var foundPlayerObj = [];

		if (playerObjects.length > 0) {
			for(var i = 0; i < playerObjects.length; i++) {
				foundPlayerObj[i] = false;
				if (me.game.getEntityByGUID(playerObjects[i].GUID) !== null) {
					foundPlayerObj[i] = true;
				}

				if (foundPlayerObj[i] == false && playerObjects[i].settings.entityName && !playerObjects[i].dead) {
					// !!! Game Engine Logic !!! //
					addObjectToClient(playerObjects[i]);
				}
			}
		}

		// If Host, update all socketObjects to server
		var foundGameObj = [];

		if (socketObjects.length > 0 && clientid == host) {
			socketResponse('updateobjects', socketObjects);

			// Check if we should remove from host
			for(var i = 0; i < socketObjects.length; i++) {
				// Checking if we should remove object
				if (socketObjects[i].dead == true) {
					socketObjects.splice(i,1);
				}
			}
		}

		// If Slave, read objects from Servexr and add to game if not added yet
		if (socketObjects && clientid != host && me.state.ready) {
			for(var i = 0; i < socketObjects.length; i++) {

				foundGameObj[i] = false;
				// !!! Game Engine Logic !!! //
				if (me.game.getEntityByGUID(socketObjects[i].GUID) !== null) {
					foundGameObj[i] = true;
				}

				// If the object has not been added to non-host client
				if (foundGameObj[i] == false && socketObjects[i].settings.entityName && !socketObjects[i].dead) {
					addObjectToClient(socketObjects[i]);
				}
			}
	  }
  },
  clientLoopMilliseconds); // Set milliseconds to update from socketObjects
};

/**
 * Kick things off
 *
 *
 */
initClientLoop();