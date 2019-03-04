const _ = require("lodash");
const smoothie = require("smoothie");
const SmoothieChart = smoothie.SmoothieChart;
const TimeSeries = smoothie.TimeSeries;
var GraphWidget = function GraphWidget(
  element_selector,
  chartoptions,
  getValueFunc
) {
  if (chartoptions === undefined) {
    chartoptions = {};
  }

  if (getValueFunc === undefined) {
    getValueFunc = function(invalue) {
      return invalue;
    };
  }
  this.getValueFunc = getValueFunc;
  var NUM_TICKS_HORIZONTAL = 5;

  //super():
  Object.call(this);
  var self = this;
  this.lastData = 0;
  this.lastUpdate = 0;
  this.parentElement = element_selector;

  this.canvas = document.createElement("canvas");
  this.canvas.setAttribute("width", this.parentElement.offsetWidth);
  this.canvas.setAttribute("height", this.parentElement.offsetHeight);
  this.parentElement.append(this.canvas);

  var ctx = this.canvas.getContext("2d");

  var smoothie_options = {
    interpolation: "linear",
    millisPerPixel: 50,
    grid: {
      strokeStyle: "rgb(125, 0, 0)",
      fillStyle: "rgb(60, 0, 0)",
      lineWidth: 1,
      millisPerLine: 1000,
      verticalSections: 6
    },
    labels: { fillStyle: "rgb(255, 0, 0)" },
    maxValue: 5,
    minValue: 0
  };
  smoothie_options = _.extend(smoothie_options, chartoptions);
  this.chart = new SmoothieChart(smoothie_options);
  this.chart.streamTo(this.canvas);
  this.line1 = new TimeSeries();
  this.chart.addTimeSeries(this.line1, {
    strokeStyle: "rgb(0, 255, 0)",
    fillStyle: "rgba(0, 255, 0, 0.4)",
    lineWidth: 3
  });
};
GraphWidget.prototype = Object.create(Object.prototype);

GraphWidget.prototype.update = function() {
  this.lastData = this.getValueFunc();
  if (this.lastUpdate > 2) {
    this.line1.append(new Date().getTime(), this.lastData);
    this.lastUpdate = 0;
  }
  this.lastUpdate += 1;
};

module.exports = GraphWidget;
