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
        this.JUMPING_SPEED = 600;
    },

    preload: function(){
        this.load.image('g','images/ground.png');
        this.load.image('pf','images/platform.png');
        this.load.image('gor','images/gorilla3.png');
        this.load.image('ab','images/arrowButton.png');
        this.load.image('acb','images/actionButton.png');
        this.load.image('br','images/barrel.png');

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

        console.log(this.levelData);

        this.platforms = this.add.group();
        this.platforms.enableBody = true;

        this.levelData.platformData.forEach(function(element){
            this.platforms.create(element.x, element.y, 'pf', 3)
        }, this);

        this.platforms.setAll('body.immovable', true);
        this.platforms.setAll('body.allowGravity', false);

        this.player = this.add.sprite(this.levelData.playerStart.x,this.levelData.playerStart.y, "player" , 3);
        this.player.anchor.setTo(0.5);
        this.player.animations.add('walking', [0, 1, 2, 1], 6, true);
        this.player.play("walking");
        this.game.physics.arcade.enable(this.player);
        this.player.customParams= {};

        this.game.camera.follow(this.player);

        this.createOnScreenControls();
    },

    update: function(){
        this.game.physics.arcade.collide(this.player, this.ground, this.landed);
        this.game.physics.arcade.collide(this.player, this.platforms, this.landed);

        this.player.body.velocity.x = 0;

        if(this.cursors.left.isDown || this.player.customParams.isMovingLeft){
            this.player.body.velocity.x = -this.RUNNING_SPEED;
        }
        else if(this.cursors.right.isDown || this.player.customParams.isMovingRight){
            this.player.body.velocity.x = this.RUNNING_SPEED;
        }

        if((this.cursors.up.isDown || this.player.customParams.mustJump)&& this.player.body.touching.down){
            this.player.body.velocity.y = -this.JUMPING_SPEED;
            this.player.customParams.mustJump = false;
        }

    },
    landed: function(player, gorund){
        console.log("landed");
    },
    createOnScreenControls: function(){
        this.leftArrow = this.add.button(20, 535, 'ab');
        this.rightArrow = this.add.button(110, 535, 'ab');
        this.actionArrow = this.add.button(220, 535, 'acb');

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
}

var game = new Phaser.Game(360, 592, Phaser.AUTO);
game.state.add("GameState", GameState);
game.state.start("GameState");

