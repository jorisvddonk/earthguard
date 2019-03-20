import _ from 'lodash'
import smoothie from 'smoothie'
const SmoothieChart = smoothie.SmoothieChart
const TimeSeries = smoothie.TimeSeries

class GraphWidget {
  public getValueFunc: any
  public lastData: number
  public lastUpdate: number
  public parentElement: any
  public canvas: HTMLCanvasElement
  public chart: any
  public line1: any
  constructor(element_selector, chartoptions, getValueFunc) {
    if (chartoptions === undefined) {
      chartoptions = {}
    }

    if (getValueFunc === undefined) {
      getValueFunc = function(invalue) {
        return invalue
      }
    }
    this.getValueFunc = getValueFunc

    this.lastData = 0
    this.lastUpdate = 0
    this.parentElement = element_selector

    this.canvas = document.createElement('canvas')
    let style = window.getComputedStyle(this.parentElement, null)
    this.canvas.setAttribute(
      'width',
      parseInt(style.width) -
        parseInt(style.paddingLeft) -
        parseInt(style.paddingRight) +
        'px'
    )
    this.canvas.setAttribute(
      'height',
      parseInt(style.height) -
        parseInt(style.paddingTop) -
        parseInt(style.paddingBottom) +
        'px'
    )
    this.parentElement.append(this.canvas)

    const ctx = this.canvas.getContext('2d')

    let smoothie_options = {
      interpolation: 'linear',
      millisPerPixel: 50,
      grid: {
        strokeStyle: 'rgb(125, 0, 0)',
        fillStyle: 'rgb(60, 0, 0)',
        lineWidth: 1,
        millisPerLine: 1000,
        verticalSections: 6,
      },
      labels: { fillStyle: 'rgb(255, 0, 0)' },
      maxValue: 5,
      minValue: 0,
    }
    smoothie_options = _.extend(smoothie_options, chartoptions)
    this.chart = new SmoothieChart(smoothie_options)
    this.chart.streamTo(this.canvas)
    this.line1 = new TimeSeries()
    this.chart.addTimeSeries(this.line1, {
      strokeStyle: 'rgb(0, 255, 0)',
      fillStyle: 'rgba(0, 255, 0, 0.4)',
      lineWidth: 3,
    })
  }

  public update() {
    this.lastData = this.getValueFunc()
    if (this.lastUpdate > 2) {
      this.line1.append(new Date().getTime(), this.lastData)
      this.lastUpdate = 0
    }
    this.lastUpdate += 1
  }
}

export default GraphWidget
