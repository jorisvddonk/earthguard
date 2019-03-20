class PIDController {
  constructor(kp,
    ki,
    kd,
    minIntegral,
    maxIntegral,
    minCapIntegral,
    maxCapIntegral) {
    this.kP = kp; //-0.7;
    this.kI = ki; //-0.01;
    this.kD = kd; //-0.3;
    this.minIntegral = minIntegral;
    this.maxIntegral = maxIntegral;
    this.minCapIntegral = minCapIntegral;
    this.maxCapIntegral = maxCapIntegral;

    this.error = null;
    this.previousError = null;
    this.integralError = null;
    this.derivativeError = null;

    this.retError = null;
  }

  update(current, target) {
    this.error = target - current;
  }

  step() {
    if (this.previousError === null) {
      this.previousError = this.error;
    }
    this.derivativeError = this.error - this.previousError;
    this.integralError = this.integralError + this.error;

    if (
      this.minCapIntegral !== undefined &&
      this.minCapIntegral !== null &&
      this.integralError < this.minCapIntegral
    ) {
      this.integralError = this.minCapIntegral;
    }
    if (
      this.maxCapIntegral !== undefined &&
      this.maxCapIntegral !== null &&
      this.integralError > this.maxCapIntegral
    ) {
      this.integralError = this.maxCapIntegral;
    }

    let mP = this.error * this.kP;
    let mI = this.integralError * this.kI;
    let mD = this.derivativeError * this.kD;

    if (
      this.minIntegral !== undefined &&
      this.minIntegral !== null &&
      mI < this.minIntegral
    ) {
      mI = this.minIntegral;
    }
    if (
      this.maxIntegral !== undefined &&
      this.maxIntegral !== null &&
      mI > this.maxIntegral
    ) {
      mI = this.maxIntegral;
    }

    this.last = {
      mP: mP,
      mI: mI,
      mD: mD
    };

    this.previousError = this.error;
    this.retError = mP + mI + mD;
    return this.retError;
  }

  getError() {
    return this.retError;
  }

  reset() {
    this.integralError = 0;
  }
}

export default PIDController;
