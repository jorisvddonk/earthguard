define('graphwidget', function(){
  var GraphWidget = function GraphWidget(element_selector, watchobj, watchselector, chartoptions, newvaluetransformer) {
    if (chartoptions === undefined) {
      chartoptions = {};
    }

    if (newvaluetransformer === undefined) {
      newvaluetransformer = function(invalue) {
        return invalue;
      };
    }
    var NUM_TICKS_HORIZONTAL = 5;


    //super():
    Object.call(this);
    var self = this;
    this.lastData = 0;
    this.lastUpdate = 0;
    this.parentElement = $(element_selector);

    this.canvas = $("<canvas width=\"" + this.parentElement.width() + "\" height=\"" + this.parentElement.height() + "\"></canvas>");
    this.parentElement.append(this.canvas);

    var ctx = this.canvas.get(0).getContext("2d");
    this.observer = new PathObserver(watchobj, watchselector);
    this.observer.open(function(newValue, oldValue) {
      self.lastData = newvaluetransformer(newValue);
    });

    var smoothie_options = {
      interpolation:'linear',
      millisPerPixel:50,
      grid: { strokeStyle:'rgb(125, 0, 0)', fillStyle:'rgb(60, 0, 0)',
              lineWidth: 1, millisPerLine: 1000, verticalSections: 6, },
      labels: { fillStyle:'rgb(255, 0, 0)'},
      maxValue:5,minValue:0
    };
    smoothie_options = _.extend(smoothie_options, chartoptions);
    this.chart = new SmoothieChart(smoothie_options);
    this.chart.streamTo(this.canvas.get(0));
    this.line1 = new TimeSeries();
    this.chart.addTimeSeries(this.line1, { strokeStyle:'rgb(0, 255, 0)', fillStyle:'rgba(0, 255, 0, 0.4)', lineWidth:3 });
  };
  GraphWidget.prototype = Object.create(Object.prototype);

  GraphWidget.prototype.update = function() {
    if (this.lastUpdate > 2) {
      this.line1.append(new Date().getTime(), this.lastData);
      this.lastUpdate = 0;
    }
    this.lastUpdate += 1;
  };

  return GraphWidget;
});