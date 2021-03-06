import _ from 'lodash'
import tinycolor from 'tinycolor2'
const colorIncrement = 0.1
let nextColor = -colorIncrement
const DEFAULT_OPTIONS = {}

export class Faction {
  public name: string
  public color: any
  constructor(options) {
    nextColor += colorIncrement
    nextColor = nextColor % 1
    options = _.extend(
      { color: tinycolor(options.color || { h: nextColor, s: 1, l: 0.5 }) },
      DEFAULT_OPTIONS,
      options
    )
    this.name = options.name
    this.color = options.color
  }
}
