import Sylvester from './sylvester-withmods'

const Mymath = {}

Mymath.largest_root_of_quadratic_equation = function(a, b, c) {
  //a, b and c should be floats
  //returns: float
  return (b + Math.sqrt(b * b - 4 * a * c)) / (2 * a)
}

Mymath.intercept = function(shooter, bullet_speed, target, target_velocity) {
  // shooter = point (vector x/y coords)
  // bullet_speed = float
  // target = point
  // target_velocity = vector
  var a = bullet_speed * bullet_speed - target_velocity.dot(target_velocity)
  var b = -2 * target_velocity.dot(target.subtract(shooter))
  var c = -target.subtract(shooter).dot(target.subtract(shooter))
  var lrg = Mymath.largest_root_of_quadratic_equation(a, b, c)
  if (isNaN(lrg)) {
    return null
  } else {
    var interception_world = target.add(target_velocity.multiply(lrg))
    return interception_world.subtract(shooter)
  }
}

Mymath.clamp = function(num, min, max) {
  return num < min ? min : num > max ? max : num
}

Mymath.prettyfloat = function(inf) {
  if (inf === undefined) {
    return 'NaN'
  }
  retval = ''
  if (inf >= 0) {
    retval = ' '
  }
  retval += inf.toFixed(4)
  return retval
}

Mymath.clampRot = function(inrot) {
  return Mymath.clamp(inrot, -Math.PI * 0.01, Math.PI * 0.01)
}

Mymath.clampThrust = function(inthrust) {
  return Mymath.clamp(inthrust, -1, 1)
}

////////////////

/**
 * Return the firing solution for a projectile starting at 'src' with
 * velocity 'v', to hit a target, 'dst'.
 *
 * @param Object src position of shooter
 * @param Object dst position & velocity of target
 * @param Number v   speed of projectile
 * @return Object Coordinate at which to fire (and where intercept occurs)
 *
 * E.g.
 * >>> intercept({x:2, y:4}, {x:5, y:7, vx: 2, vy:1}, 5)
 * = {x: 8, y: 8.5}
 *
 * SOURCE: http://stackoverflow.com/questions/2248876/2d-game-fire-at-a-moving-target-by-predicting-intersection-of-projectile-and-u
 */
Mymath.intercept2 = function(src, dst, v) {
  let tx = dst.x - src.x
  let ty = dst.y - src.y
  let tvx = dst.vx
  let tvy = dst.vy

  // Get quadratic equation components
  let a = tvx * tvx + tvy * tvy - v * v
  let b = 2 * (tvx * tx + tvy * ty)
  let c = tx * tx + ty * ty

  // Solve quadratic
  let ts = Mymath.quad(a, b, c) // See quad(), below

  // Find smallest positive solution
  let sol = null
  if (ts) {
    let t0 = ts[0]
    let t1 = ts[1]
    let t = Math.min(t0, t1)
    if (t < 0) t = Math.max(t0, t1)
    if (t > 0) {
      sol = {
        x: dst.x + dst.vx * t,
        y: dst.y + dst.vy * t,
      }
    }
  }

  if (sol != null) {
    sol = new Sylvester.Vector([sol.x, sol.y]).subtract(
      new Sylvester.Vector([src.x, src.y])
    )
  }

  return sol
}

/**
 * Return solutions for quadratic
 */
Mymath.quad = function(a, b, c) {
  let sol = null
  if (Math.abs(a) < 1e-6) {
    if (Math.abs(b) < 1e-6) {
      sol = Math.abs(c) < 1e-6 ? [0, 0] : null
    } else {
      sol = [-c / b, -c / b]
    }
  } else {
    let disc = b * b - 4 * a * c
    if (disc >= 0) {
      disc = Math.sqrt(disc)
      a = 2 * a
      sol = [(-b - disc) / a, (-b + disc) / a]
    }
  }
  return sol
}

export default Mymath
