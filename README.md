socketObject
============

Framework for developing action-based games using Node.js and Socket.io
Tutorial is coming soon!


GAME OBJECTS
--------------

INIT of object

- settings.sendSocket = true;
- settings.entityName = 'SkullEnemyEntity';
- if (clientid == host) {
   this.socketInit();
  }

REMOVE of object
- this.socketRemoveObject();

UPDATE loop of object
- if (clientid == host) {
		// Host controls logic for behavior of object
  }
  else {
    // Slave simply reads position from socketObjects
  }

- this.updateSocketEntity();



PLAYER OBJECTS
----------------

- Each client (host and slave) sends player position at game loop interval
- Server.js adds these to socketObjects array to be parsed into game like any other object
  (Other than being tagged by clientid to know who to add as socketPlayerEntity)
