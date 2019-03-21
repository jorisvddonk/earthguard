import _ from 'lodash'
import GameObject from '../gameObject'
import ObjectRegistry from '../objectRegistry'
import ShipSubsystem from '../shipSubsystem'
import Sylvester from '../sylvester-withmods'
import {
  TargetType,
  Target,
  createTarget,
  createTask,
  TaskType,
  Task,
} from '../targets'

class AISubsystem extends ShipSubsystem {
  public task: Task
  constructor(ship, options) {
    super(ship)
    this.subsystemType = 'ai'
    this.task = createTask(TaskType.IDLE)
  }

  public tick() {
    if (this.task && this.task.target) {
      if (
        ((this.task.target.type === TargetType.GAMEOBJECT ||
          this.task.target.type === TargetType.SHIP) &&
          !ObjectRegistry.has(this.task.target.tgt)) ||
        this.task.target.type === TargetType.LOST
      ) {
        console.log(this.ship._objid, 'Target lost', this.task.target)
        const evt = new createjs.Event('ai_targetLost', false, false)
        evt.data = { task: this.task, target: this.task.target }
        this.ship.dispatchEvent(evt)
      }
    }
  }

  public getTarget() {
    return this.task.target
  }

  public getTask() {
    return this.task
  }

  public setTask(task: Task) {
    if (!(task instanceof Task)) {
      throw new Error(`Task is no task! ${task}`)
    }
    this.task = task
    const evt = new createjs.Event('ai_taskChanged', false, false)
    evt.data = { task }
    this.ship.dispatchEvent(evt)
  }

  public clearTask() {
    this.task = createTask(TaskType.IDLE)
  }
}

export default AISubsystem
