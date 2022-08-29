var GameState = {
    init: function(){
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;

        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.physics.arcade.gravity.y = 1000;

        this.cursors = this.game.input.keyboard.createCursorKeys();

        this.game.world.setBounds(0,0,360,700);

        this.RUNNING_SPEED = 150;
        this.JUMPING_SPEED = 550;
    },

    preload: function(){
        this.load.image('g','images/ground.png');
        this.load.image('pf','images/platform.png');
        this.load.image('goal','images/gorilla3.png');
        this.load.image('ab','images/arrowButton.png');
        this.load.image('acb','images/actionButton.png');
        this.load.image('barrel','images/barrel.png');

        this.load.spritesheet("player",'images/player_spritesheet.png', 28, 30, 5, 1, 1);
        this.load.spritesheet("fire","images/fire_spritesheet.png", 20, 21, 2, 1, 1);

        this.load.text('level','level.json')
    },

    create: function(){
        this.ground = this.add.sprite(0,638,'g');
        this.game.physics.arcade.enable(this.ground);
        this.ground.body.allowGravity = false;
        this.ground.body.immovable = true;

        this.levelData = JSON.parse(this.game.cache.getText('level'));


        this.platforms = this.add.group();
        this.platforms.enableBody = true;

        this.levelData.platformData.forEach(function(element){
            this.platforms.create(element.x, element.y, 'pf', 3)
        }, this);

        this.platforms.setAll('body.immovable', true);
        this.platforms.setAll('body.allowGravity', false);

        this.fires = this.add.group();
        this.fires.enableBody = true;

        var fire;
        this.levelData.fireData.forEach(function(element){
             fire = this.fires.create(element.x, element.y, 'fire');
             fire.animations.add("fire", [0,1], 4, true);
             fire.play("fire");
        }, this)

        this.fires.setAll("body.allowGravity", false);

        this.goal = this.add.sprite(this.levelData.goal.x, this.levelData.goal.y, "goal");
        this.game.physics.arcade.enable(this.goal);
        this.goal.body.allowGravity = false;

        this.player = this.add.sprite(this.levelData.playerStart.x,this.levelData.playerStart.y, "player" , 3);
        this.player.anchor.setTo(0.5);
        this.player.animations.add('walking', [0, 1, 2, 1], 6, true);
        this.player.play("walking");
        this.game.physics.arcade.enable(this.player);
        this.player.customParams= {};

        this.game.camera.follow(this.player);

        this.createOnScreenControls();

        this.barrels = this.add.group();
        this.barrels.enableBody = true;

        this.createBarrel();
        this.barrelCreator = this.game.time.events.loop(Phaser.Timer.SECOND * this.levelData.barrelFrequency , this.createBarrel, this);

    },

    update: function(){

        this.player.body.collideWorldBounds = true;
        this.player.body.bounce.set(1, 0);
        this.game.physics.arcade.collide(this.player, this.ground, this.landed);
        this.game.physics.arcade.collide(this.player, this.platforms, this.landed);

        this.game.physics.arcade.collide(this.barrels, this.ground, this.landed);
        this.game.physics.arcade.collide(this.barrels, this.platforms, this.landed);

        this.game.physics.arcade.overlap(this.player, this.fires, this.killPlayer);
        this.game.physics.arcade.overlap(this.player, this.barrels, this.killPlayer);
        this.game.physics.arcade.overlap(this.player, this.goal, this.win);

        this.player.body.velocity.x = 0;

        if(this.cursors.left.isDown || this.player.customParams.isMovingLeft){
            this.player.body.velocity.x = -this.RUNNING_SPEED;
            this.player.scale.setTo(1,1);
            this.player.play('walking');
        }
        else if(this.cursors.right.isDown || this.player.customParams.isMovingRight){
            this.player.body.velocity.x = this.RUNNING_SPEED;
            this.player.scale.setTo(-1, 1);
            this.player.play('walking');
        }
        else{
            this.player.animations.stop();
            this.player.frame = 3;
        }

        if((this.cursors.up.isDown || this.player.customParams.mustJump)&& this.player.body.touching.down){
            this.player.body.velocity.y = -this.JUMPING_SPEED;
            this.player.customParams.mustJump = false;
        }
        this.barrels.forEach(function(element){
            if(element.x < 10 && element.y > 600) {
                element.kill();
            }
        }, this)

    },
    landed: function(player, ground){
        //console.log("landed");
    },
    createOnScreenControls: function(){
        this.leftArrow = this.add.button(20, 650, 'ab');
        this.rightArrow = this.add.button(110, 650, 'ab');
        this.actionArrow = this.add.button(220, 650, 'acb');

        this.leftArrow.alpha = 0.5;
        this.rightArrow.alpha = 0.5;
        this.actionArrow.alpha = 0.5;

        this.leftArrow.fixedToCamara = true;
        this.rightArrow.fixedToCamara = true;
        this.actionArrow.fixedToCamara = true;

        this.actionArrow.events.onInputDown.add(function(){
            this.player.customParams.mustJump = true;
        }, this);

        this.actionArrow.events.onInputUp.add(function(){
            this.player.customParams.mustJump = false;
        }, this);


        this.leftArrow.events.onInputDown.add(function(){
            this.player.customParams.isMovingLeft = true;
        }, this);

        this.leftArrow.events.onInputUp.add(function(){
            this.player.customParams.isMovingLeft = false;
        }, this);

        this.rightArrow.events.onInputDown.add(function(){
            this.player.customParams.isMovingRight = true;
        }, this);

        this.rightArrow.events.onInputUp.add(function(){
            this.player.customParams.isMovingRight = false;
        }, this);
    },
    killPlayer: function(player, fire){
        console.log("ouch!");
        game.state.start('GameState');
    },
    win: function(player, goal){
        alert("you win!");
        game.state.start("GameState");
    },
    createBarrel: function(){
        var barrel = this.barrels.getFirstExists(false);
        
        if(!barrel) {
            barrel = this.barrels.create(0, 0, 'barrel');
        }

        barrel.body.collideWorldBounds = true;
        barrel.body.bounce.set(1, 0);
        barrel.reset(this.levelData.goal.x, this.levelData.goal.y);
        barrel.body.velocity.x = this.levelData.BarrelSpeed;
    },
}

var game = new Phaser.Game(360, 592, Phaser.AUTO);
game.state.add("GameState", GameState);
game.state.start("GameState");

