class RedAlien {
  constructor() {
    this.alienWidth = 30;
    this.alienHeight = 15;
    this.x = width - this.alienWidth;
    this.y = 50;
    this.alive = true;
    this.image = alien4;
    this.points = floor(random(50, 300));
    this.points -= this.points % 10;  // removes remainder, rounding points to the lowest ten
    this.explosionTimer = 6;
    this.scoreTimer = 5;
    this.shotLocation = random(this.alienWidth, width - this.alienWidth);
    print('shot location: ' + this.shotLocation);
    this.redLaserFired = false;
  }

  draw() {
    if (this.alive) { // only draws alien if it is alive
      image(this.image, this.x, this.y, this.alienWidth, this.alienHeight);
      if(this.x < this.shotLocation && !this.redLaserFired){
        redLaser = new Laser(this.x, this.y + (this.alienHeight / 2), laserSpeed * 1.2, red);
        lasers.push(redLaser);
        this.redLaserFired = true;
        print('red laser fired!!');
      }
    }
    if (!this.alive) {
      if (this.explosionTimer > 0) {
        this.die();
        this.explosionTimer -= 1;
      }
    }
    if (!this.alive && this.explosionTimer == 0 && this.scoreTimer > 0){
      stroke(red);
      noFill();
      textSize(12);
      strokeWeight(1);
      textAlign(CENTER);
      text(this.points, this.x, this.y + 5);
      this.scoreTimer -= 1;
    }
  }

  move() {
    if(this.alive){
      this.x -= 5;
    }
  }

  // draws exposding alien ship animation
  die() {
    push();
    translate(this.x, this.y);
    noFill();
    stroke(255, 0, 0);
    strokeWeight(2);
    for (let i = 0; i < 20; i++) {
      line(floor(random(2, 10)), 0, floor(random(15, 20)), 0);
      rotate(random(0, ((4 * PI) / 10)));
    }
    pop();
  }

}