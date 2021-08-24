import { beer, hp } from "./hud.js";
const domApp = document.getElementById("app");
var config = {
  parent: domApp,
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  resize: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  audio: {
    disableWebAudio: true
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

var game = new Phaser.Game(config);

function preload() {
  // Carga los assets
  // this.load.setBaseURL("https://labs.phaser.io");
  this.load.audio("grr", "assets/grr.mp3");
  this.load.audio("aah", "assets/aah.mp3");

  this.load.image("sky", "assets/sky.png");
  this.load.image("ground", "assets/platform.png");
  this.load.image("beer", "assets/beer.png");
  this.load.image("bomb", "assets/bomb.png");
  this.load.spritesheet("dude", "assets/ger.png", {
    frameWidth: 32,
    frameHeight: 48,
  });
}

var platforms,
  cursors,
  player,
  bombs,
  gameOver = false;

  var grito, eructo;
  
  hp.count = 3;

var gameOverText;
  
function create() {
  grito = this.sound.add('aah');
  eructo = this.sound.add("grr");
  //background
  this.add.image(400, 300, "sky");

  // platforms
  platforms = this.physics.add.staticGroup();
  platforms.create(400, 568, "ground").setScale(2).refreshBody();
  // platforms.create(600, 400, "ground");
  // platforms.create(10, 450, "ground");
  // platforms.create(50, 250, "ground");
  // platforms.create(750, 220, "ground");

  //player
  player = this.physics.add.sprite(100, -450, "dude");
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);
  player.setSize(24, 0);

  this.physics.add.collider(player, platforms);
  // player.body.setGravityY(300);

  //Define las animaciones
  // Left
  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });

  // Right
  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1,
  });

  // Turn
  this.anims.create({
    key: "turn",
    frames: [{ key: "dude", frame: 4 }],
    frameRate: 20,
  });

  // Dead
  this.anims.create({
    key: "dead",
    frames: this.anims.generateFrameNumbers("dude", { start: 9, end: 19 }),
    frameRate: 10,
    repeat: 0,
    hideOnComplete: true,
  });

  // score
  beer.list = this.physics.add.group({
    key: "beer",
    repeat: 11,
    setXY: { x: 12, y: 0, stepX: 70 },
  });
  beer.list.children.iterate((e) => {
    e.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });

  this.physics.add.collider(beer.list, platforms);
  this.physics.add.overlap(player, beer.list, collectBeer, null, this);

  // hud
  beer.title = this.add.text(16, 16, "Alcohol en Sangre: 0.0 g/L", {
    fontSize: "24px",
    fontStyle: "bold",
    fill: "#000",
  });

  hp.title = this.add.text(16, 50, "", {
    fontSize: "16px",
    fill: "darkred",
  });

  gameOverText = this.add.text(80, 600 / 2, "", {
    fontSize: "50px",
    fontStyle: "bold",
    fill: "darkred",
  });

  //bombs
  bombs = this.physics.add.group();
  this.physics.add.collider(bombs, platforms);
  this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update() {
  cursors = this.input.keyboard.createCursorKeys();
  if (!gameOver) {
    if (cursors.left.isDown) {
      player.setVelocityX(-160);

      player.anims.play("left", true);
    } else if (cursors.right.isDown) {
      player.setVelocityX(160);

      player.anims.play("right", true);
    } else {
      player.setVelocityX(0);

      player.anims.play("turn");
    }

    if (cursors.up.isDown && player.body.touching.down) {
      player.setVelocityY(-330);
    }
  } else {
    this.physics.pause();
    gameOverText.setText("PERDISTE POR GORREADO!!");
    player.setBounce(0);
    player.anims.play("dead", true);
  }
  checkLive(this);
}

function collectBeer(player, item) {
  item.disableBody(true, true);
  beer.count += 0.125;
  beer.title.setText("Alcohol en Sangre:" + beer.count.toFixed(3) + "g/L");
  eructo.play();

  if (beer.list.countActive(true) === 0) {
    beer.list.children.iterate(function (child) {
      child.enableBody(true, child.x, 0, true, true);
    });
  } else {
    var x =
      player.x < 400
        ? Phaser.Math.Between(400, 800)
        : Phaser.Math.Between(0, 400);

    var bomb = bombs.create(x, 16, "bomb");
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
  }
}

function hitBomb(player, bomb) {
  hp.count--;
  grito.play();
  player.anims.play("turn", true);
}


function checkLive(obj){
  let live = "";
  if (hp.count > 0) {
    for (let i = 0; i < hp.count; i++) {
      live += "█ ";
    }
  }else{
    gameOver = true;
  }
  hp.title.setText(live);
}