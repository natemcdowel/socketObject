PLAYER OBJECTS
----------------

- Each client (host and slave) sends player position at game loop interval
- Server.js adds these to socketObjects array to be parsed into game like any other object
  (Other than being tagged by clientid to know who to add as socketPlayerEntity)



TUTORIAL
------------------

We'll need to walk through a few steps to set up your game for use with socketObject

- <strong>socketObjectEntity.js</strong>

	1. Extend the generic game object class that all in-game objects inherit from.  By default, when using MelonJS, this is:

		<pre>me.socketObjectEntity = me.ObjectEntity.extend({</pre>

	2. Any game objects that inherited from the generic game object class (such as Enemy, Item, Player classes) should extend 'me.socketObjectEntity'.  Example:

		<pre>var AllEnemyEntity = me.socketObjectEntity.extend({</pre>

	3. Replace remove : function() with engine-specific code. Example:

		<pre>remove : function() {
			// Replace with engine-specific code for removing game objects
			me.game.remove(this);
		},
		</pre>


	4. Define the keys and objects that you want to pass in defindSocketObjectStructure : function(). GUID is required. Example:
		<pre>
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
		</pre>
    The GUID property should be named to the key of the game object.  If the game object is "this.id", change to "GUID:'id'"

- socketObjects (Not playerObjects) inheriting from socketObjectEntity.js

	1. In the constructor of the class, to initialize a socketObject:

		- Define:
			<pre>this.settings.sendSocket = true;</pre>
			<pre>this.settings.entityName = _className;</pre>

			Example:
			<pre>this.settings.entityName = 'SkullEnemyEntity';<pre>

			for a class named

			<pre>var SkullEnemyEntity = AllEnemyEntity.extend({</pre>

		- At the bottom of the constructor:

				if (clientid == host) {
					this.socketInit();
				}

	2. In the update loop of these objects, wrap all position / velocity generating logic in this condition:

		<pre>
		if (clientid == host) {
			// Host controls logic for behavior of object
	  	}
	  	</pre>

	  - Place this function before collision is checked and update function returns:
		
	  	<pre>this.updateSocketEntity();</pre>

	  	- Example:
			   <pre>
			   // check & update movement
				this.updateSocketEntity();
				this.updateMovement();
				this.parent();
				return true;
				</pre>
