export default function Parallax(manifestID, parallax_factor, queue, stage) {
  var plx = new createjs.Container()
  plx.gfx = {
    bitmaps: [],
    width: null,
    height: null,
  }
  plx.parallax_factor = parallax_factor
  var tbitmap = new createjs.Bitmap(queue.getResult(manifestID))
  plx.gfx.width = tbitmap.image.width
  plx.gfx.height = tbitmap.image.height
  var ix = 0
  var iy = 0
  function addParallaxBitmap(x, y, ix, iy) {
    var bmap = new createjs.Bitmap(queue.getResult(manifestID))
    bmap.regX = 0
    bmap.regY = 0
    bmap.x = x
    bmap.y = y
    plx.gfx.bitmaps.push(bmap)
    plx.addChild(bmap)
  }
  for (
    let y = 0;
    y < myCanvas.height * (1 / stage.scaleY) + 1 * plx.gfx.height;
    y = y + plx.gfx.height
  ) {
    ix = 0
    for (
      let x = 0;
      x < myCanvas.width * (1 / stage.scaleX) + 1 * plx.gfx.width;
      x = x + plx.gfx.width
    ) {
      addParallaxBitmap(x, y, ix, iy)
      ix += 1
    }
    iy += 1
  }

  plx.GFXTick = function() {
    plx.x =
      stage.regX -
      plx.gfx.width -
      ((stage.regX * plx.parallax_factor) % plx.gfx.width) +
      myCanvas.width * 0.5
    while (plx.x - stage.regX > 0) {
      plx.x = plx.x - plx.gfx.width
    }
    while (plx.x - stage.regX < -plx.gfx.width) {
      plx.x = plx.x + plx.gfx.width
    }

    plx.y =
      stage.regY -
      plx.gfx.height -
      ((stage.regY * plx.parallax_factor) % plx.gfx.height) +
      myCanvas.height * 0.5
    while (plx.y - stage.regY > 0) {
      plx.y = plx.y - plx.gfx.height
    }
    while (plx.y - stage.regY < -plx.gfx.height) {
      plx.y = plx.y + plx.gfx.height
    }
  }

  return plx
}
