// Title: Classic Space Invaders
// Author: Daniel Kaye
// site: http://www.dnkaye.com/2020_CodingChallenges.html

class MyShip {
  constructor() {
    this.x = width / 2
    this.y = height - 20;
    this.shipWidth = 26;
    this.shipHeight = 8;
    this.cannonWidth = 5;
    this.direction = 'none';
    this.lives = 3;
    this.shotInterval = 5;
    this.lastShotFiredTimestamp = -this.shotInterval;
    this.color = green;
  }

  // draws the player
  drawPlayer() {
    fill(this.color);
    rectMode(CENTER);
    noStroke();
    this.drawShip(this.x, this.y);
  }

  drawExtraLives() {
    fill(green);
    let x = width - 105;
    for (let i = 0; i < this.lives; i++) {
      this.drawShip(x, 25);
      x += 40;
    }
  }

  // stores and draws geometry for player's ship
  drawShip(x, y) {
    rect(x, y, this.shipWidth, this.shipHeight, 2);
    rect(x, y - this.shipHeight / 2 - this.cannonWidth / 2, this.cannonWidth, this.cannonWidth);
    rect(x, y - this.shipHeight / 2 - this.cannonWidth - 1, 2, 2);
  }

  move() {
    if(!pauseMode){
      if (this.direction === 'left' && this.x > this.shipWidth/2) {
        this.x -= 5;
      }
      if (this.direction === 'right' && this.x < width - this.shipWidth/2) {
        this.x += 5;
      }
    }
  }

  changeDirection(direction) {
    this.direction = direction;
  }

  fire() {
    //  only fires a shot if last shot was fired more than 10 frames ago
    if (frameCount - this.lastShotFiredTimestamp > this.shotInterval) {
      shots.push(new Shot(this.x, this.y - (this.shipHeight), 1));
      this.lastShotFiredTimestamp = frameCount; // records time at which this shot was fired
    }
  }
}