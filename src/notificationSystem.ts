import d3 from 'd3'

export enum NotificationType {
  ERROR = 'ERROR',
  SHIP_DESTROYED = 'SHIP_DESTROYED',
  COMMUNICATIONS = 'COMMUNICATIONS',
}

export interface INotification {
  type: NotificationType
  message: string
  index?: number
}

export class NotificationSystem {
  private notificationBarElement: HTMLElement
  private bubbleElement: HTMLElement
  private data: INotification[]
  private ind: number
  private chart: any
  private notificationSVGElement: HTMLElement

  constructor(notificationBarSelector: string, bubbleSelector: string) {
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

  public push(notification: INotification) {
    notification.index = ++this.ind
    this.data.push(notification)
    this.update()
  }

  public pop(index) {
    this.data.splice(index, 1)
    this.update()
  }

  private getSVGX(d, i) {
    return (
      this.notificationSVGElement.clientWidth -
      (this.data.length - i - 1) * 22 -
      12 +
      'px'
    )
  }

  private update() {
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

let notificationSystem: NotificationSystem

export default {
  get: (): NotificationSystem => {
    return notificationSystem
  },
  init: (bar: string, bubble: string) => {
    notificationSystem = new NotificationSystem(bar, bubble)
  },
}
