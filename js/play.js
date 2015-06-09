var playState = {

	create: function() { 
        game.add.tileSprite(0, 0, 24000, 600, 'fondo');
        
        
		this.cursor = game.input.keyboard.createCursorKeys();
		game.input.keyboard.addKeyCapture([Phaser.Keyboard.UP, Phaser.Keyboard.DOWN, Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT]);
		this.wasd = {
			up: game.input.keyboard.addKey(Phaser.Keyboard.W),
			left: game.input.keyboard.addKey(Phaser.Keyboard.A),
			right: game.input.keyboard.addKey(Phaser.Keyboard.D)
		};

		game.global.score = 0;
		this.createWorld();
        
        this.stateScore = false;

		this.player = game.add.sprite(game.world.centerX, game.world.centerY, 'player');
		game.physics.arcade.enable(this.player); 
		this.player.anchor.setTo(0.5, 0.5);
		this.player.body.gravity.y = 0;
		this.player.animations.add('right', [0, 1, 2, 3, 4, 5, 6], 14, true);
		//this.player.animations.add('left', [1, 2], 8, true);
        game.camera.follow(this.player);

		this.enemies = game.add.group();
		this.enemies.enableBody = true;
		this.enemies.createMultiple(10, 'enemy');

		this.coin = game.add.sprite(60, 140, 'coin');
		game.physics.arcade.enable(this.coin); 
		this.coin.anchor.setTo(0.5, 0.5);
        //tween moneda
        game.add.tween(this.coin).to({angle: -20}, 500).to({angle:20}, 500).loop().start(); 
        
        //Disparar
        this.balas = game.add.group();
        this.balas.enableBody = true;
        this.balas.physicsBodyType = Phaser.Physics.ARCADE;
        this.balas.createMultiple (100, 'laser');
        this.balas.setAll('anchor.x' , 0.5);
        this.balas.setAll('anchor.y' , 1);
        this.balas.setAll('outOfBoundSkill', true);
        this.balas.setAll('checkWorldBounds', true);
        this.balaTime = 1500;
        this.tecla = game.input.keyboard.addKey(Phaser.Keyboard.X);
        this.tecla2 = game.input.keyboard.addKey(Phaser.Keyboard.Z);
        
        
        
		this.scoreLabel = game.add.text(30, 30, 'score: 0', { font: '18px Arial', fill: '#ffffff' });	
       
         //Vidas
                      this.vidaLabel = game.add.text(30, 60, 'Vidas: 5', { font: '18px Arial', fill: '#ffffff' });
                      game.global.vida = 5;
        
        //Generador de vidas	
		              this.vidas = game.add.group();
		              this.vidas.enableBody = true;
		              this.vidas.createMultiple(30, 'corazon');
        //loop que crea las vidas
                      game.time.events.loop(10000, this.addVida, this);
                      


    //crea los enemigos cada 2 segundos
        this.createWorld();
		game.time.events.loop(1200, this.addEnemy, this);
        
        
        
        
		this.emitter = game.add.emitter(0, 0, 15);
		this.emitter.makeParticles('pixel');
		this.emitter.setYSpeed(-150, 150);
		this.emitter.setXSpeed(-150, 150);
		this.emitter.gravity = 0;

		this.jumpSound = game.add.audio('jump');
		this.coinSound = game.add.audio('coin');
		this.deadSound = game.add.audio('dead');	
		
		this.nextEnemy = 0;
        
      
        
        
        
 
	},

	update: function() {
		game.physics.arcade.overlap(this.player, this.enemies, this.loseVida, null, this);
		game.physics.arcade.overlap(this.player, this.coin, this.takeCoin, null, this);
		game.physics.arcade.collide(this.player, this.layer);
		game.physics.arcade.collide(this.enemies, this.layer);
        //fisicas
   //Sistema per matar enemics disparant
        this.balas.forEachAlive(function(dispararBala){
            this.enemies.forEachAlive(function(enemy){
                game.physics.arcade.overlap(this.balas, this.enemies, this.enemyDie, null, this);
            },this);
        },this);
         //añadimos fisicas a las vidas
                      game.physics.arcade.collide(this.vidas, this.walls);
        //añadimos el contacto con el jugador
                      game.physics.arcade.overlap(this.player, this.vidas, this.takeVida, null, this);

	//	if (!this.player.inWorld) {
	//		this.playerDie();
	//	}

		this.movePlayer();

		if (this.nextEnemy < game.time.now) {
			var start = 4000, end = 1000, score = 100;
			var delay = Math.max(start - (start-end)*game.global.score/score, end);
			    
			this.addEnemy();
			this.nextEnemy = game.time.now + delay;
            
            
            
            }


          if(this.tecla.isDown){
              this.dispararBala();
          }
        
         if(this.tecla2.isDown){
              this.dispararBala();
          }
        
        



	},
    
    
      enemyDie: function(bullet, enemy) {  
        bullet.kill();
        this.emitter.x = enemy.x;
        this.emitter.y = enemy.y;
        this.emitter.start(true, 600, null, 15);
        enemy.kill();
        
    },
    

    

	movePlayer: function() {
		if (this.cursor.left.isDown || this.wasd.left.isDown) {
			this.player.body.velocity.x = -200;
			this.player.animations.play('left');
		}
		else if (this.cursor.right.isDown || this.wasd.right.isDown) {
			this.player.body.velocity.x = 200;
			this.player.animations.play('right');
		}
		else {
			this.player.body.velocity.x = 0;
 			this.player.animations.stop(); 
	        this.player.frame = 0; 
		}
		
		if ((this.cursor.up.isDown || this.wasd.up.isDown) /*&& this.player.body.touching.down*/) {
			this.jumpSound.play();
			this.player.body.velocity.y = -320;
		}
        
        if ((this.cursor.down.isDown) /*&& this.player.body.touching.down*/) {
			this.player.body.velocity.y = 320;
		}
	},

	addEnemy: function() {
		var enemy = this.enemies.getFirstDead();
	 var Grande = Phaser.Math.randomSign();
		if (!enemy) {
			return;
		}
        
  

                 enemy.anchor.setTo(0.5, 1);
		         enemy.reset(game.world.centerX, 0);
		         enemy.body.gravity.y = 500;
		         enemy.body.velocity.x = 100 * Phaser.Math.randomSign();
		         enemy.body.bounce.x = 1;
		         enemy.checkWorldBounds = true;
		         enemy.outOfBoundsKill = true;
                
                

        
	},

	takeCoin: function(player, coin) {
        
		game.global.score += 5;
		this.scoreLabel.text = 'score: ' + game.global.score;
       
		this.updateCoinPosition();

		this.coinSound.play();
		game.add.tween(this.player.scale).to({x:1.3, y:1.3}, 50).to({x:1, y:1}, 150).start();
		this.coin.scale.setTo(0, 0);
		game.add.tween(this.coin.scale).to({x: 1, y:1}, 300).start();
        game.add.tween(this.scoreLabel.scale).to({x:1.3, y:1.3}, 50).to({x:1, y:1}, 150).start();
        
      if(game.global.score > localStorage.getItem('bestScore')) {
          
            if(this.stateScore == false){
                   
                     this.stateScore = true;
                     this.superarLabel = game.add.text(game.world.centerX , game.world.centerY, "Nuevo record de puntuacion!", { font: '18px Arial', fill: '#ffffff' });	
                      
                     game.time.events.add(2000, this.killsuperarLabel, this);     
                     tween = game.add.tween(this.superarLabel).to( { x: 100 }, 2000, Phaser.Easing.Bounce.Out, true);
                
      }
                
      }
	},
    
    
    
    
    killsuperarLabel: function(){
               game.world.remove(this.superarLabel);
    
        
    },

	updateCoinPosition: function() {
		var coinPosition = [
			{x: 140, y: 60}, {x: 360, y: 60}, 
			{x: 60, y: 140}, {x: 440, y: 140}, 
			{x: 130, y: 300}, {x: 370, y: 300} 
		];

		for (var i = 0; i < coinPosition.length; i++) {
			if (coinPosition[i].x === this.coin.x) {
				coinPosition.splice(i, 1);
			}
		}

		var newPosition = coinPosition[game.rnd.integerInRange(0, coinPosition.length-1)];
		this.coin.reset(newPosition.x, newPosition.y);
	},
    

                
    
      
    //funcion vidas
    addVida: function(){
      var vidax = this.vidas.getFirstDead();
        if (!vidax) {
			return;
		}
        
        vidax.anchor.setTo(0.5, 1);
		vidax.reset(game.world.centerX, 0);
		vidax.body.gravity.y = 300;
		vidax.body.velocity.x = 70 * Phaser.Math.randomSign();
		vidax.body.bounce.x = 1;
		vidax.checkWorldBounds = true;
		vidax.outOfBoundsKill = true;
        
    },
    
    
    
    dispararBala: function(){
        
        if(game.time.now > this.balaTime)
        {
            this.bala = this.balas.getFirstExists(false);
            
        if(this.bala){
              if(this.tecla.isDown){
                  this.bala.reset(this.player.x, this.player.y + 8);
                  this.bala.body.velocity.x = 400;
                  this.balaTime = game.time.now + 500;
              }else if (this.tecla2.isDown){
                  this.bala.reset(this.player.x, this.player.y + 8);
                  this.bala.body.velocity.x = -400;
                  this.balaTime = game.time.now + 500;
              } else {
                    this.bala.reset(this.player.x, this.player.y + 8);
                    this.bala.body.velocity.x = 400;
                    this.balaTime = game.time.now + 500;
        
              }
               
        }
    }
        
},
    
    
    
    
    loseVida: function(){
        
       
        	game.global.vida -= 1; 
		    this.vidaLabel.text = 'Vidas: ' + game.global.vida; 
            for (var i = 0; i<this.enemies.length; i++){
            this.enemies.getAt(i).kill();
            }
        
          if(game.global.vida < 0){
              game.state.start('menu');
          }
        
        
    },
    
    takeVida: function() {
        
		game.global.vida += 1; 
        this.vidaLabel.text = 'Vidas: ' + game.global.vida;
		   for (var i = 0; i<this.enemies.length; i++){
            this.vidas.getAt(i).kill();
            }
	},

	playerDie: function() {
	
		game.state.start('menu');
		

		this.deadSound.play();
		this.emitter.x = this.player.x;
		this.emitter.y = this.player.y;
		this.emitter.start(true, 600, null, 15);

		
	},

	startMenu: function() {
		game.state.start('menu');
	},

	createWorld: function() {
        
        /*     
          var nMap;
          
        
        
        this.game.add.sprite(0, 0, 'desert1');
        this.mMap = this.game.add.tilemap('map');
 
    
 
         this.mMap.addTilesetImage('tileset');
         //mMap.addTilesetImage('desert2');
   
    

          this.mLayer = this.mMap.createLayer('Capa de Patrones 1');
          this.mLayer.resizeWorld();
          this.mMap.setCollision(1);  
 
    

         this.game.physics.arcade.enable(this.mLayer);
         
         */
        
   
        this.map = this.game.add.tilemap('Runner');
        this.map.addTilesetImage('terrain','terreno');
        this.map.addTilesetImage('Ugly_cropped_lava_flow_make_a_better_1','lava');
        this.map.addTilesetImage('CaveBackground','cave1');
        this.map.addTilesetImage('CaveBaseForeground','cave2');
        this.map.addTilesetImage('CaveEntrance','cave3');
        this.map.addTilesetImage('CaveEntranceD','cave4');
        this.map.addTilesetImage('platshrooms','setas');
        
        
        this.layer = this.map.createLayer('Capa de Patrones 1');
        
        //this.game.add.sprite(0, 0, 'fondo');
        
       
        this.layer.resizeWorld();
        this.map.setCollisionBetween(1,5000);
        
		//this.walls = game.add.group();
		//this.walls.enableBody = true;
      /*
		game.add.sprite(0, 0, 'wallV', 0, this.walls); 
		game.add.sprite(480, 0, 'wallV', 0, this.walls); 
		game.add.sprite(0, 0, 'wallH', 0, this.walls); 
		game.add.sprite(300, 0, 'wallH', 0, this.walls);
		game.add.sprite(0, 320, 'wallH', 0, this.walls); 
		game.add.sprite(300, 320, 'wallH', 0, this.walls); 
		game.add.sprite(-100, 160, 'wallH', 0, this.walls); 
		game.add.sprite(400, 160, 'wallH', 0, this.walls); 

		var middleTop = game.add.sprite(100, 80, 'wallH', 0, this.walls);
		middleTop.scale.setTo(1.5, 1);
		var middleBottom = game.add.sprite(100, 240, 'wallH', 0, this.walls);
		middleBottom.scale.setTo(1.5, 1);

		this.walls.setAll('body.immovable', true);
        */
	}
    
    
};