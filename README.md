- Framework for developing action-based games using Node.js and Socket.io.
- Extend any game object with socketObjectEntity.js to pass as a socketObject
- Host / Slave networking model, hosted from clientid == 0 machine (You'll need to open a port on your router)
- Uses position interpolation to compensate for latency


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

- <strong>Game objects inheriting from socketObjectEntity.js</strong>

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

- <strong>socketClient.js</strong>
	
	1. Include socketClient.js in your index.html file before the end of the body tag.

	2. Replace var addObjectToClient = function(serverObject) { , code with engine-specific code for adding game objects.
		<pre>
			var addObjectToClient = function(serverObject) {
				// Engine-specific code for adding objects passed from the server to the game
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
		</pre>

	3. Replace var findGameObjectByGUID = function(GUID) { code , code with engine-specific code for finding game objects 		by Id. Example:
		<pre>var findGameObjectByGUID = function(GUID) {
			// Engine-specific code for finding game objects based on GUID
			return me.game.getEntityByGUID(GUID);
		}</pre>
			
