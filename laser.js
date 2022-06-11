class Laser {
  constructor(x, y, s, c) {
    this.x = x;
    this.y = y;
    this.sign = 1; // used to make laser zigzag
    this.used = false;
    this.speed = s;
    this.c = c;
  }

  draw() {
    if (!this.used) {
      noFill();
      stroke(this.c);
      strokeWeight(1);
      if(this.c == red){
        strokeWeight(2);
      }
      beginShape();
      vertex(this.x, this.y);
      vertex(this.x + (2 * this.sign), this.y + 2);
      vertex(this.x - (2 * this.sign), this.y + 6);
      vertex(this.x, this.y + 8);
      endShape();
      // only squiggle lasers if game is not currently in pause mode
      if(!pauseMode){
        this.sign *= -1;
      }
    }
  }

  move() {
    this.y += this.speed;
  }
}