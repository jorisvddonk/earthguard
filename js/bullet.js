var Bullet = function Bullet(position, velocity){
  //super():
  createjs.Container.call(this);

  //
  this.gfx = {
    bitmap: new createjs.Bitmap(queue.getResult('bullet')),
    graph: new createjs.Shape()
  };
  this.addChild(this.gfx.bitmap, this.gfx.graph);
  this.gfx.bitmap.regX = this.gfx.bitmap.image.width*0.5;
  this.gfx.bitmap.regY = this.gfx.bitmap.image.height*0.5;

  this.movementVec = velocity;
  this.positionVec = position;

  this.stats = {
    aliveUntil: new Date().getTime() + 1000
  };

  eventHub.addEventListener("movementTick", this.movementTick.bind(this));
  eventHub.addEventListener("GFXTick", this.GFXTick.bind(this));
};

Bullet.prototype = Object.create(createjs.Container.prototype);

Bullet.prototype.movementTick = function movementTick(event) {
  if (event.timeStamp > this.stats.aliveUntil) {
    stage.removeChild(this);
    this.removeAllEventListeners();
    return;
  }
  this.positionVec = this.positionVec.add(this.movementVec);
  this.x = this.positionVec.e(1);
  this.y = this.positionVec.e(2);
};

Bullet.prototype.GFXTick = function GFXTick() {
};