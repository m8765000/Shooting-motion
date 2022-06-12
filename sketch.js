let canvas;
let player;
let green;
let red;
let white;
let bgColor;
let shots = []; // stores all shots
let aliens = []; // stores all aliens
let redAlienUFOThing;
let lasers = [];
let redLaser;
let score = 0;
let highScore = 0;
// all alien ship images
let alien1_a;
let alien1_b;
let alien2_a;
let alien2_b;
let alien3_a;
let alien3_b;
let alien4; // red alien ship
let speed = 10; // aliens move once ever x frames, lower is faster.
laserSpeed = 10; // speed at which alien laser shots move
let alienDirection = 'left';
let chanceOfFiringLaser = 50; // x% change an alien a random alien shoots a laser every time the aliens moved. Increases slowly to increase difficulty
let pauseMode = false;
let pauseTime = 0;
let gameOverBool = false;
let isThereARedAlien = false;

  let classifier;
  let imageModelURL = 'https://teachablemachine.withgoogle.com/models/MdEw76Gv7/';

  let video;
  let flippedVideo;
  let label = "";
  let left;
  let right;

function preload() {
  alien1_a = loadImage('images/alien1_a.png');
  alien1_b = loadImage('images/alien1_b.png');
  alien2_a = loadImage('images/alien2_a.png');
  alien2_b = loadImage('images/alien2_b.png');
  alien3_a = loadImage('images/alien3_a.png');
  alien3_b = loadImage('images/alien3_b.png');
  alien4 = loadImage('images/alien4.png');
  classifier = ml5.imageClassifier(imageModelURL + 'model.json');
}

function setup() {
  canvas = createCanvas(400, 400);
  canvas.id('spaceInvaders');
  
      video = createCapture(VIDEO);
    video.size(320, 240);

    flippedVideo = ml5.flipImage(video);
    classifyVideo();
  
  noSmooth(); // turns off anti-aliasing
  green = color(51, 255, 0);
  red = color(255, 51, 0);
  white = color(255);
  bgColor = color(50);
  frameRate(10); // 
  player = new MyShip();
  createAllAliens();
  imageMode(CENTER);
  setInterval(createRedAlien, 30000);
}

function draw() {
      background(125);
    fill(255);
    textSize(16);
    textAlign(CENTER);
    text(label, width/2, 700);
    console.log(label);
  
  if (focused || frameCount < 30) {
    background(bgColor);
    player.move();
    player.drawPlayer();
    player.drawExtraLives();
    drawScore();
    if (!pauseMode) { // if the game is not currently in pause mode....
      // run the functions that incrimentally move everything
      moveAllShots();
      moveAllLasers();
      moveRedLaser();
      // events that only occur based on the current speed, not every frame
      if (frameCount % speed == 0) {
        moveAllAliens();
        fireLaser();
      }
      moveRedAlien();
    }
    if (pauseMode) {
      animateNewLife();
    }
    drawAllShots();
    drawAllLasers();
    drawAllAliens();
    drawRedAlien();
    hitAlien();
    hitPlayer();
    hitRedAlien();
    if (allAliensKilled()) {
      print('all aliens killed!');
      resetAliens();
    }
  } else {
    drawUnpauseInstructions();
  }
  
    if (label === 'left') {
    print('directon changes!');
    player.changeDirection('left');
  }
  if (label == 'right') {
    player.changeDirection('right');
  }
}

  function classifyVideo() {
    flippedVideo = ml5.flipImage(video)
    classifier.classify(flippedVideo, gotResult);
    flippedVideo.remove();

  }

  function gotResult(error, results) {
    if (error) {
      console.error(error);
      return;
    }
    label = results[0].label;
    // Classifiy again!
    classifyVideo();
  }


function drawUnpauseInstructions() {
  noStroke();
  fill(255);
  textAlign(CENTER);
  textSize(18);
  text('click to play', width / 2, height - height/4);
}

function keyPressed() {
  if (key === !pauseMode) {
    if (!pauseMode) {
      print('shot fired!');
      player.fire();
    }
  }
  if (label === 'left') {
    print('directon changes!');
    player.changeDirection('left');
  }
  if (label == right) {
    player.changeDirection('right');
  }
  if ((keyCode === RETURN || keyCode === ENTER) && gameOverBool) {
    reset();
  }
  return false; // prevents default browser behaviors
}

function mousePressed() {}

function keyReleased() {
  if (keyIsPressed === false) {
    player.changeDirection('none');
  }
}

function drawAllShots() {
  for (let shot of shots) {
    shot.draw();
  }
}

function moveAllShots() {
  for (let shot of shots) {
    shot.move();
  }
}

function createAllAliens() {
  let startingX = 70;
  let startingY = 200;
  // creates bottom two rows of alien 1!
  for (i = 0; i < 22; i++) {
    aliens[i] = new Alien(startingX, startingY, 20, 20, alien1_a, alien1_b, 10);
    startingX += 30;
    if (startingX > width - 30) {
      startingX = 70;
      startingY -= 30;
    }
  }
  // creates middle two rows of alien 2!
  for (i = 22; i < 44; i++) {
    aliens[i] = new Alien(startingX, startingY, 18, 14, alien2_a, alien2_b, 20);
    startingX += 30;
    if (startingX > width - 30) {
      startingX = 70;
      startingY -= 30;
    }
  }
  // creates top two rows of alien 3!
  for (i = 44; i < 55; i++) {
    aliens[i] = new Alien(startingX, startingY, 14, 14, alien3_a, alien3_b, 40);
    startingX += 30;
    if (startingX > width - 30) {
      startingX = 70;
      startingY -= 30;
    }
  }
}

function drawAllAliens() {
  for (let alien of aliens) {
    alien.draw();
  }
}

// moves all aliens
function moveAllAliens() {
  for (let alien of aliens) {
    alien.moveHorizontal(alienDirection);
  }
  if (checkIfAliensReachedEdge()) {
    reverseAlienDirections();
    moveAllAliensDown();
  }
}

function checkIfAliensReachedEdge() {
  let edgeReached = false;
  for (let alien of aliens) {
    if ((alien.x < 15 && alien.alive) || (alien.x > width - 15 && alien.alive)) {
      edgeReached = true;
    }
  }
  return edgeReached;
}

// reverse horizontal travel direction of all(most all) aliens & moves them down
function reverseAlienDirections() {
  if (alienDirection === 'left') {
    alienDirection = 'right';
  } else {
    alienDirection = 'left';
  }
}

function moveAllAliensDown() {
  for (let alien of aliens) {
    alien.moveVertical();
  }
}

function hitAlien() {
  for (let shot of shots) {
    for (let alien of aliens) {
      // if(dist(alien.x, alien.y, shot.x, shot.y) < 10){
      if (shot.x > alien.x - alien.alienWidth / 2 &&
        shot.x < alien.x + alien.alienWidth / 2 &&
        shot.y - shot.length > alien.y - alien.alienHeight / 2 &&
        shot.y - shot.length < alien.y + alien.alienHeight / 2 &&
        !shot.hit && alien.alive
      ) {
        alien.alive = false;
        shot.hit = true;
        score += alien.points; // increases score when an alien is shot
      }
    }
  }
}

// returns true if all aliens have been shot
function allAliensKilled() {
  let bool = true;
  for (let alien of aliens) {
    if (alien.alive) {
      bool = false;
    }
  }
  return bool;
}

// resets alaien positions and incriments speed
function resetAliens() {
  createAllAliens();
  redAlienUFOThing.x = 0 - redAlienUFOThing.shipWidth; // hides any current red alien off screen if game is reset
  if (speed > 2) {
    speed -= 2;
  }
  chanceOfFiringLaser += 10;

}

function fireLaser() {
  // only fires laser if random number from 0 to 100 is less than the current 'chance of firing laser) global varialbe
  if (random(100) < chanceOfFiringLaser) {
    let i = floor(random(aliens.length));
    if (aliens[i].alive) {
      let l = new Laser(aliens[i].x, aliens[i].y + (aliens[i].alienHeight / 2), laserSpeed, white);
      lasers.push(l);
    }
  }
}

// draws all lasers
function drawAllLasers() {
  for (let laser of lasers) {
    laser.draw();
  }
}

// moves all active lasers
function moveAllLasers() {
  for (let laser of lasers) {
    laser.move();
  }
}

// draws score to screen
function drawScore() {
  noStroke();
  fill(255);
  textSize(14);
  textAlign(LEFT);
  text('LIVES: ', width - 175, 28);
  text('SCORE:', 25, 28);
  // makes score red if it has surpased the previous high score
  if (highScore > 0 && score > highScore) {
    fill(red);
  }
  text(score, 85, 28);
}

// checks if player was hit
function hitPlayer() {
  for (let laser of lasers) {
    let leftEdgeOfLaser = laser.x - 2;
    let rightEdgeOfLaser = laser.x + 2;
    let frontOfLaser = laser.y + 8;
    let backOfLaser = laser.y;
    let leftEdgeOfShip = player.x - (player.shipWidth / 2);
    let rightEdgeOfShip = player.x + (player.shipWidth / 2);
    let frontOfShip = player.y - (player.shipHeight / 2);
    let backOfShip = player.y + (player.shipHeight / 2);

    // below shapes used for figuring out and debigging of laser/ship overlap detection 
    //     noFill();
    //     stroke(255, 0, 0);
    //     strokeWeight(1);
    //     beginShape();
    //     vertex(leftEdgeOfLaser, backOfLaser);
    //     vertex(leftEdgeOfLaser, frontOfLaser);
    //     vertex(rightEdgeOfLaser, frontOfLaser);
    //     vertex(rightEdgeOfLaser, backOfLaser);
    //     endShape(CLOSE);

    //     beginShape();
    //     vertex(leftEdgeOfShip, backOfShip);
    //     vertex(leftEdgeOfShip, frontOfShip);
    //     vertex(rightEdgeOfShip, frontOfShip);
    //     vertex(rightEdgeOfShip, backOfShip);
    //     endShape(CLOSE);

    // if the player has been shot...
    if (rightEdgeOfLaser > leftEdgeOfShip &&
      leftEdgeOfLaser < rightEdgeOfShip &&
      frontOfLaser > frontOfShip &&
      backOfLaser < backOfShip &&
      !laser.used) {
      print('player hit!!!');
      laser.used = true; // that laser is now used and can't hit player again, or be drawn
      if (player.lives > 0) {
        lifeLost();
      }
      if (player.lives == 0) {
        gameOver();
      }
    }
  }
}

// functio level up
function levelUp() {}

// function life lost
function lifeLost() {
  pauseTime = frameCount;
  print('life lost!');
  player.color = red;
  pauseMode = true;
}

// animates a new life
function animateNewLife() {
  print('animating new life');
  //  makes the player blink for 30 frames
  if ((frameCount - pauseTime > 5 && frameCount - pauseTime < 10) ||
    (frameCount - pauseTime > 15 && frameCount - pauseTime < 20) ||
    (frameCount - pauseTime > 25 && frameCount - pauseTime < 30)
  ) {
    noStroke();
    fill(bgColor);
    rectMode(CENTER);
    // draws background colored rectangle over player to make it appear as if it's blinking
    rect(player.x, player.y - 4,
      player.shipWidth + 2, player.shipHeight + 8);
  }
  // after 30 frames, resets player with new life
  if (frameCount - pauseTime > 30) {
    player.color = green;
    player.x = width / 2;
    pauseMode = false;
    player.lives -= 1;
    // clears all current lasers
    // or else player could get hit with laser as soon as they respawn with their new life in the center, which is unfair
    for (let laser of lasers) {
      laser.used = true;
    }
    // clears all current shots too
    for (let shot of shots) {
      shot.hit = true;
    }
  }
}

// clears all current lasers
function clearAllLasers() {}

// function game over
function gameOver() {
  gameOverBool = true;
  background(0, 125);
  print('game over!');
  textSize(60);
  stroke(0);
  fill(255);
  textAlign(CENTER);
  text('GAME OVER', width / 2, height / 2);
  textSize(20);
  text('Score: ' + score, width / 2, height / 2 + 50);
  if (score > highScore) {
    fill(red);
    text('NEW HIGH SCORE!!!', width / 2, height / 2 + 75);
    fill(255);
  }
  text("Press 'ENTER' to play again!", width / 2, height / 2 + 125);
  noLoop();
}

// resets game
function reset() {
  highScore = score;
  score = 0;
  player = new MyShip();
  createAllAliens();
  for (let laser of lasers) {
    laser.used = true;
  }
  // clears all current shots too
  for (let shot of shots) {
    shot.hit = true;
  }
  loop();
}

// create red alien
function createRedAlien() {
  redAlienUFOThing = new RedAlien();
  isThereARedAlien = true;
  print('red alien created!');
}

// moves red alien only if one exists
function moveRedAlien() {
  if (isThereARedAlien) {
    redAlienUFOThing.move();
  }
}

// draws red alien only if one exists
function drawRedAlien() {
  if (isThereARedAlien) {
    redAlienUFOThing.draw();
  }
}

function hitRedAlien() {
  if (isThereARedAlien) {
    for (let shot of shots) {
      if (shot.x > redAlienUFOThing.x - redAlienUFOThing.alienWidth / 2 &&
        shot.x < redAlienUFOThing.x + redAlienUFOThing.alienWidth / 2 &&
        shot.y - shot.length > redAlienUFOThing.y - redAlienUFOThing.alienHeight / 2 &&
        shot.y - shot.length < redAlienUFOThing.y + redAlienUFOThing.alienHeight / 2 &&
        !shot.hit && redAlienUFOThing.alive
      ) {
        redAlienUFOThing.alive = false;
        shot.hit = true;
        score += redAlienUFOThing.points; // increases score when an alien is shot
      }
    }
  }
}

function moveRedLaser() {
  if (isThereARedAlien) {
    if (redAlienUFOThing.redLaserFired) {
      redLaser.move();
    }
  }
}
