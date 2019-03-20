export default class Parallax extends createjs.Container {
  public gfx: { bitmaps: any[]; width: any; height: any }
  public parallaxFactor: any
  public myCanvas: any
  private initialized: boolean
  private queue: any
  private manifestID: any
  constructor(manifestID, parallaxFactor, queue, myCanvas) {
    super()
    this.gfx = {
      bitmaps: [],
      width: null,
      height: null,
    }
    this.myCanvas = myCanvas
    this.queue = queue
    this.manifestID = manifestID
    this.parallaxFactor = parallaxFactor
    const tbitmap = new createjs.Bitmap(queue.getResult(manifestID))
    this.gfx.width = tbitmap.image.width
    this.gfx.height = tbitmap.image.height
    this.initialized = false
  }

  public GFXTick() {
    if (!this.initialized) {
      this.initialize()
    }
    this.x =
      this.stage.regX -
      this.gfx.width -
      ((this.stage.regX * this.parallaxFactor) % this.gfx.width) +
      this.myCanvas.width * 0.5
    while (this.x - this.stage.regX > 0) {
      this.x = this.x - this.gfx.width
    }
    while (this.x - this.stage.regX < -this.gfx.width) {
      this.x = this.x + this.gfx.width
    }

    this.y =
      this.stage.regY -
      this.gfx.height -
      ((this.stage.regY * this.parallaxFactor) % this.gfx.height) +
      this.myCanvas.height * 0.5
    while (this.y - this.stage.regY > 0) {
      this.y = this.y - this.gfx.height
    }
    while (this.y - this.stage.regY < -this.gfx.height) {
      this.y = this.y + this.gfx.height
    }
  }

  private addParallaxBitmap(x, y, ix, iy) {
    const bmap = new createjs.Bitmap(this.queue.getResult(this.manifestID))
    bmap.regX = 0
    bmap.regY = 0
    bmap.x = x
    bmap.y = y
    this.gfx.bitmaps.push(bmap)
    this.addChild(bmap)
  }

  private initialize() {
    let ix = 0
    let iy = 0
    for (
      let y = 0;
      y < this.myCanvas.height * (1 / this.stage.scaleY) + 1 * this.gfx.height;
      y = y + this.gfx.height
    ) {
      ix = 0
      for (
        let x = 0;
        x < this.myCanvas.width * (1 / this.stage.scaleX) + 1 * this.gfx.width;
        x = x + this.gfx.width
      ) {
        this.addParallaxBitmap(x, y, ix, iy)
        ix += 1
      }
      iy += 1
    }
    this.initialized = true
  }
}
