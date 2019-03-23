import _ from 'lodash'
import ShipSubsystem from '../shipSubsystem'

export enum MessageType {
  TAKEN_DAMAGE = 'TAKEN_DAMAGE',
}

export interface IMessage {
  type: MessageType
  data: any
}

export class MemorySubsystem extends ShipSubsystem {
  private deque: IMessage[]
  private deque_indexOfLast: number
  private limit: any
  constructor(ship, options) {
    super(ship)
    options = Object.assign(
      {
        limit: 100,
      },
      options
    )
    this.subsystemType = 'memory'

    this.deque = []
    this.deque_indexOfLast = -1
    this.limit = options.limit
  }

  public push(type: MessageType, data: any) {
    if (type === undefined || data === undefined) {
      throw new Error('Missing type or data')
    }
    this.deque.push({ type, data } as IMessage)
    this.deque_indexOfLast += 1
    if (this.deque.length > this.limit) {
      this.removeOldest()
    }
  }

  public read(
    index: number,
    callback: (index: number, message: IMessage) => void
  ) {
    const i = this.deque_indexOfLast - index
    if (i >= 0 && i < this.deque.length) {
      callback(index, this.deque[i])
    }
  }

  public readRange(
    first: number,
    last: number,
    callback: (index: number, message: IMessage) => void
  ) {
    _.range(first, last).forEach(index => {
      this.read(index, callback)
    })
  }

  public removeOldest() {
    this.deque.shift()
  }

  public getOldestIndex() {
    return this.deque_indexOfLast - this.deque.length + 1
  }

  public getNewestIndex() {
    return this.deque_indexOfLast
  }
}

export default MemorySubsystem
