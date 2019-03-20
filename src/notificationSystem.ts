import d3 from 'd3'

export class NotificationSystem {
  public notificationBarElement: any
  public bubbleElement: any
  public data: any[]
  public ind: number
  public chart: any
  public notificationSVGElement: any

  constructor(notificationBarSelector, bubbleSelector) {
    this.notificationBarElement = document.querySelector(
      notificationBarSelector
    )
    this.bubbleElement = document.querySelector(bubbleSelector)

    this.data = []
    this.ind = 0

    this.chart = d3
      .select(this.notificationBarElement)
      .append('svg')
      .attr('class', 'chart')
      .attr('width', '100%')
      .attr('height', '100%')
    this.chart.selectAll('circle').data(this.data)

    this.notificationSVGElement = this.chart[0][0]
    this.update()
  }

  public push(type, message) {
    const index = ++this.ind
    this.data.push({ type, message, index })
    this.update()
  }

  public pop(index) {
    this.data.splice(index, 1)
    this.update()
  }

  public getSVGX(d, i) {
    return (
      this.notificationSVGElement.clientWidth -
      (this.data.length - i - 1) * 22 -
      12 +
      'px'
    )
  }

  public update() {
    const rect = this.chart.selectAll('circle').data(this.data, d => d.index)

    rect
      .enter()
      .insert('circle', 'line')
      .attr('cx', (d, i) => this.notificationSVGElement.clientWidth + 50 + 'px')
      .attr('cy', '50%')
      .attr('r', 10)
      .attr('class', (d, i) => 'notification notification-' + d.type)
      .transition()
      .duration(1000)
      .attr('cx', (d, i) => this.getSVGX(d, i))

    rect
      .transition()
      .duration(1000)
      .attr('cx', (d, i) => this.getSVGX(d, i))

    rect.exit().remove()

    rect.on('mouseover', (d, i) => {
      this.bubbleElement.innerHTML = d.message
      this.bubbleElement.classList.remove('hide')
    })
    rect.on('mouseout', (d, i) => {
      this.bubbleElement.innerHTML = ''
      this.bubbleElement.classList.add('hide')
    })

    rect.on('click', (d, i) => {
      this.bubbleElement.classList.add('hide')
      this.pop(i)
    })
  }
}

let notificationSystem

export default {
  get: () => {
    return notificationSystem
  },
  init: (bar, bubble) => {
    notificationSystem = new NotificationSystem(bar, bubble)
  },
}
