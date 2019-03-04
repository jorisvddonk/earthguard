function PIDController(
  kp,
  ki,
  kd,
  minIntegral,
  maxIntegral,
  minCapIntegral,
  maxCapIntegral
) {
  var self = this;

  self.kP = kp; //-0.7;
  self.kI = ki; //-0.01;
  self.kD = kd; //-0.3;
  self.minIntegral = minIntegral;
  self.maxIntegral = maxIntegral;
  self.minCapIntegral = minCapIntegral;
  self.maxCapIntegral = maxCapIntegral;

  self.error = null;
  self.previousError = null;
  self.integralError = null;
  self.derivativeError = null;

  self.retError = null;

  self.update = function update(current, target) {
    self.error = target - current;
  };
  self.step = function step() {
    if (self.previousError === null) {
      self.previousError = self.error;
    }
    self.derivativeError = self.error - self.previousError;
    self.integralError = self.integralError + self.error;

    if (
      self.minCapIntegral !== undefined &&
      self.minCapIntegral !== null &&
      self.integralError < self.minCapIntegral
    ) {
      self.integralError = self.minCapIntegral;
    }
    if (
      self.maxCapIntegral !== undefined &&
      self.maxCapIntegral !== null &&
      self.integralError > self.maxCapIntegral
    ) {
      self.integralError = self.maxCapIntegral;
    }

    mP = self.error * self.kP;
    mI = self.integralError * self.kI;
    mD = self.derivativeError * self.kD;

    if (
      self.minIntegral !== undefined &&
      self.minIntegral !== null &&
      mI < self.minIntegral
    ) {
      mI = self.minIntegral;
    }
    if (
      self.maxIntegral !== undefined &&
      self.maxIntegral !== null &&
      mI > self.maxIntegral
    ) {
      mI = self.maxIntegral;
    }

    self.last = {
      mP: mP,
      mI: mI,
      mD: mD
    };

    self.previousError = self.error;
    self.retError = mP + mI + mD;
    return self.retError;
  };

  self.getError = function() {
    return self.retError;
  };

  self.reset = function() {
    self.integralError = 0;
  };
}

module.exports = PIDController;
