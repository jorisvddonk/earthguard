import _ from 'lodash'
import GameObject, { ObjectID } from '../gameObject'
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
import { MemoryReader } from '../memoryReader'
import objectRegistry from '../objectRegistry'
import notificationSystem from '../notificationSystem'

class AISubsystem extends ShipSubsystem {
  public task: Task
  private otherShipsHittingMe: Map<ObjectID, number>
  constructor(ship, options) {
    super(ship)
    this.subsystemType = 'ai'
    this.task = createTask(TaskType.IDLE)

    this.otherShipsHittingMe = new Map<ObjectID, number>()
    this.memoryReader = new MemoryReader(ship, {
      hit: ({ damage, perpetrator_objid }) => {
        const oldD = this.otherShipsHittingMe.get(perpetrator_objid) || 0
        const newD = oldD + damage
        this.otherShipsHittingMe.set(perpetrator_objid, newD)
        if (
          oldD < 300 &&
          newD >= 300 &&
          objectRegistry.has(perpetrator_objid)
        ) {
          const perpetrator = objectRegistry.get(perpetrator_objid)
          this.setTask(createTask(TaskType.ATTACK, perpetrator))
          notificationSystem
            .get()
            .push(
              'communications',
              `${this.ship.name} --> ${
                perpetrator.name
              }: I'll get you for this!!`
            )
        }
      },
    })
  }

  public tick() {
    super.tick()

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
