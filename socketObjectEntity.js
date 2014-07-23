/**
 * Socket functions<br>
 * socketObjects AND playerObjects are sent in an interval in socketClient.js
 *
 */

me.socketObjectEntity = me.ObjectEntity.extend({

	/**
	 * Socket function - Defines keys that will be passed through server.js through socketObjects / playerObjects arrays
	 *
	 *
	 */
	defineSocketObjectStructure : function () {
	 	this.socketObjectStructure =
		{
			GUID: 'GUID',
			pos: true,
			vel: true,
			settings: true,
			facing: true,
			currentAnim: true
		}
	},

	/**
	 * Socket function - Initializes this object information to playerObjects <br>
	 * Unlike socketObjects, each client behaves the same
	 *
	 */
	socketPlayerInit: function() {
		var playerObject = {};
		this.defineSocketObjectStructure();
	 	playerObject.GUID = this[this.socketObjectStructure.GUID]+'-'+clientid+enemyZ;
	 	this.GUID = playerObject.GUID;

	 	if (this.checkAbstractObjectGUID(this, playerObjects) === false && !this.dead) {
	 		for(var key in this.socketObjectStructure) {
	 			if (this[key] && key != 'GUID') {
	 				if (this.socketObjectStructure[key] === true) {
	 					playerObject[key] = this[key];
	 				}
	 				else {
	 					playerObject[key] = this[this.socketObjectStructure[key]];
	 				}
	 			}
	 		}
		 	socketResponse('playersaddobject',playerObject);
 		}
	},

	/**
	 * Socket function - Initializes this object information to socketObjects <br>
	 * Only used for host (clientid == 0)
	 *
	 */
	socketInit: function(player) {
		this.interpolatedFrame = false;
		this.defineSocketObjectStructure();
	 	var socketObject = {};
			 	socketObject.GUID = this.GUID;

	 	// If this GUID is not in socketObjects yet (From any other clients)
	 	if (this.checkAbstractObjectGUID(this, socketObjects) === false && !this.dead) {
	 		for(var key in this.socketObjectStructure) {
	 			if (this[key] && key != 'GUID') {
	 				if (this.socketObjectStructure[key] === true) {
	 					socketObject[key] = this[key];
	 				}
	 				else {
	 					socketObject[key] = this[this.socketObjectStructure[key]];
	 				}
	 			}
	 		}

	 		// If host, object will be passed by Interval Loop
		 	if (clientid == host) {
		 		socketObjects.push(socketObject);
		 	}
		 	// If client, object will be added immediately
		 	else {
		 		socketResponse('slaveaddobject',socketObject);
		 	}
 		}
	},

	/**
	 * Socket function - Updates this player object information to playerObjects <br>
	 * playerObjects is sent in
	 * an interval from server.js
	 *
	 */
	socketPrepSendPlayer: function() {
		var i = this.checkAbstractObjectGUID(this, playerObjects)

	 	if (i || i === 0) {
	 		for(var key in this.socketObjectStructure) {
 				if (this[key] && key != 'GUID') {
 					playerObjects[i][key] = this[key];
 				}
 			}
		 	socketResponse('playersupdatedobject',playerObjects[i]);
		}
	},

	/**
	 * Socket function - Updates this object information to socketObjects <br>
	 * socketObjects is sent in
	 * an interval in socketClient.js
	 *
	 */
	socketPrepSend: function() {
		// Find matching GUID from socketObjects
	 	var i = this.checkGUID(this);

	 	if (i || i === 0) {
	 		for(var key in this.socketObjectStructure) {
 				if (this[key] && key != 'GUID') {
 					socketObjects[i][key] = this[key];
 				}
 			}
		}
	},

	/**
	 * Socket function - Updates this object information from playerObjects <br>
	 * playerObjects is sent in
	 * an interval in socketClient.js
	 *
	 */
	updateSocketObjectPlayer : function() {
		var i = this.checkAbstractObjectGUID(this, playerObjects)

		//  If the object has already been created from host
 		if (i >= 0 && playerObjects[i] && playerObjects[i].clientid != clientid) {
 			if (playerObjects[i].dead) {
				playerObjects.splice(i,1);
 				this.remove();
 				return;
 			}

 			for(var key in playerObjects[i]) {
 				if (this[key] && key != 'GUID') {
 					this[key] = playerObjects[i][key];
 				}
 			}
 		}
 		else if (!i && i !== 0) {
 			this.remove();
 		}
	},

	/**
	 * Socket function - Interpolates middle position of found socketObject between buffered positions
	 */
	interpolateSocketObject : function () {

		// Even Frame
		if (this.interpolatedFrame) {
			this.interpolatedFrame = false;
			this.socketObjects = tickedSocketObjects[4];
		}
		// Odd Frame
		else {
			this.interpolatedFrame = true;
			this.socketObjectsLateFrame = tickedSocketObjects[3];
			this.socketObjectsEarlyFrame = tickedSocketObjects[4];
			this.socketObjects = this.socketObjectsLateFrame;

			i = this.checkGUIDOverride(this, this.socketObjectsLateFrame);
			z = this.checkGUIDOverride(this, this.socketObjectsEarlyFrame);

			if (i && z) {
				this.middle = {};
				this.middle.x = this.socketObjectsLateFrame[i].pos.x - this.socketObjectsEarlyFrame[z].pos.x;
				this.middle.y = this.socketObjectsLateFrame[i].pos.y - this.socketObjectsEarlyFrame[z].pos.y;

				if (this.socketObjects[z] && this.socketObjects[z].pos) {
					 this.socketObjects[z].pos.x = this.socketObjectsLateFrame[i].pos.x - this.middle.x;
					 this.socketObjects[z].pos.y = this.socketObjectsLateFrame[i].pos.y - this.middle.y;
				}
			}
		}
	},

	/**
	 * Socket function - Branches out in update loop depending on if client is host / slave
	 */
	updateSocketEntity : function() {
		if (clientid != host) {
			this.interpolateSocketObject();
			this.updateSocketObjectSlave();
		}
		else if (clientid == host && this.settings.sendSocket) {
			this.updateSocketObjectHost();
		}
	},

	/**
	 * Socket function - Updates object from socketObject (on SLAVE client) with socketObject keys that are defined in this.defineSocketObjectStructure();
	 */
	updateSocketObjectSlave : function () {
		i = this.checkGUID(this);

		//  If the object has already been created from host
 		if (i && this.socketObjects[i]) {
 			if (this.socketObjects[i].dead) {
				this.socketObjects.splice(i,1);
 				this.remove();
 				return;
 			}

 			for(var key in this.socketObjects[i]) {
 				if (key != 'GUID') {
	 				if (this[key] && this.socketObjects[i][key]) {
	 					if (Object.keys(this.socketObjects[i][key]).length > 1) {
	 						for(var objKey in this.socketObjects[i][key]) {
	 							if (this[key][objKey] && this.socketObjects[i][key][objKey]) {
	 								this[key][objKey] = this.socketObjects[i][key][objKey];
	 							}
	 						}
	 					}
	 					else {
	 						this[key] = this.socketObjects[i][key];
	 					}
	 				}
 				}
 			}
 		}
 		else if (!i) {
 			this.remove();
 		}
	},

	/**
	 * Socket function - Sends object (on HOST client) keys that are defined in this.defineSocketObjectStructure() and deletes object if marked as this.dead;
	 */
	updateSocketObjectHost : function() {
		var i = this.checkGUID(this);
		if (!i) {
			this.remove();
		}
		if (this.dead == true) {
			socketObjects.splice(i,1);
			this.remove();
		}
		this.socketPrepSend();
	},

	socketRemoveObject: function() {
		if (clientid != host) {
			this.dead = true;
			socketResponse('slaveupdateobjects',{dead:true, GUID:this.GUID});
		}
	},

	destroy : function() {
		// free some property objects
		if (this.renderable) {
			this.renderable.destroy.apply(this.renderable, arguments);
			this.renderable = null;
		}
		this.onDestroyEvent.apply(this, arguments);
		this.pos = null;
		this.collisionBox = null;
		if (clientid == host && this.settings.sendSocket) {
			var i = this.checkGUID(this, true);
			if (socketObjects[i]) {
				socketObjects[i].dead = true;
			}
		}
	},

	checkGUID: function(thisEntity) {
 		for(var i = 0; i < socketObjects.length; i++) {
	 		if (socketObjects[i].GUID == thisEntity.GUID) {
	 			return i;
	 		}
	 	}
	 	return false;
	},

	checkAbstractObjectGUID: function(thisEntity, objectName) {
 		for(var i = 0; i < objectName.length; i++) {
	 		if (objectName[i].GUID == thisEntity.GUID) {
	 			return i;
	 		}
	 	}
	 	return false;
	},

	checkGUIDOverride: function(thisEntity, overriddenSocketObjects) {
		for(var i = 0; i < overriddenSocketObjects.length; i++) {
	 		if (overriddenSocketObjects[i].GUID == thisEntity.GUID) {
	 			return i;
	 		}
	 	}
	},

	remove : function() {
		me.game.remove(this);
	}
})