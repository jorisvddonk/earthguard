Mymath = {};

Mymath.largest_root_of_quadratic_equation = function(a, b, c){
  //a, b and c should be floats
  //returns: float
  return (b+Math.sqrt(b*b-4*a*c))/(2*a);
};

Mymath.intercept = function(shooter, bullet_speed, target, target_velocity){
  // shooter = point (vector x/y coords)
  // bullet_speed = float
  // target = point
  // target_velocity = vector
  var a = bullet_speed*bullet_speed - target_velocity.dot(target_velocity);
  var b = -2*target_velocity.dot(target.subtract(shooter));
  var c = -(target.subtract(shooter)).dot(target.subtract(shooter));
  var lrg = Mymath.largest_root_of_quadratic_equation(a,b,c);
  if (isNaN(lrg)) {
    return null;
  } else {
    var interception_world = target.add(target_velocity.multiply(lrg));
    return interception_world.subtract(shooter);
  }
};

Mymath.clamp = function(num, min, max) {
    return num < min ? min : (num > max ? max : num);
};


Mymath.prettyfloat = function(inf) {
  if (inf === undefined) {
    return "NaN";
  }
  retval = "";
  if (inf >= 0) {
    retval = " ";
  }
  retval += inf.toFixed(4);
  return retval;
};

Mymath.clampRot = function(inrot) {
  return Mymath.clamp(inrot, -Math.PI*0.01, Math.PI*0.01);
};

Mymath.clampThrust = function(inthrust) {
  return Mymath.clamp(inthrust,-1,1);
};