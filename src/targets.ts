import Planet from './planet'
import Ship from './ship'
import Sylvester from './sylvester-withmods'
import GameObject, { ObjectID } from './gameObject'
import objectRegistry from './objectRegistry'

export enum TargetType {
  SHIP = 'SHIP',
  GAMEOBJECT = 'GAMEOBJECT',
  POSITION = 'POSITION',
  HALT = 'HALT',
  IDLE = 'IDLE',
  LOST = 'LOST', // special
}

export class Target {
  public type: TargetType
  public tgt:
    | ObjectID
    | Sylvester.Vector
    | TargetType.HALT
    | TargetType.IDLE
    | TargetType.LOST

  constructor(
    type: TargetType,
    target:
      | ObjectID
      | Sylvester.Vector
      | TargetType.HALT
      | TargetType.IDLE
      | TargetType.LOST
  ) {
    this.tgt = target
    this.type = type
  }

  public getGameObject() {
    if (this.type === TargetType.GAMEOBJECT || this.type === TargetType.SHIP) {
      // ObjectID
      return objectRegistry.get(this.tgt) || TargetType.LOST
    } else {
      return new Error('Not a gameobject target!')
    }
  }

  public getTargetPosition() {
    if (this.type === TargetType.GAMEOBJECT || this.type === TargetType.SHIP) {
      // ObjectID
      const obj = this.getGameObject()
      if (obj !== TargetType.LOST) {
        return this.getGameObject().positionVec
      } else {
        return obj
      }
    } else if (this.tgt instanceof Sylvester.Vector) {
      return this.tgt
    } else if (
      this.type === TargetType.HALT ||
      this.type === TargetType.IDLE ||
      this.type === TargetType.LOST
    ) {
      return this.type
    } else {
      throw new Error('???')
    }
  }
}

export function createTarget(
  target:
    | ObjectID
    | Sylvester.Vector
    | TargetType.HALT
    | TargetType.IDLE
    | TargetType.LOST
    | Ship
    | Planet
): Target | null {
  if (target instanceof Ship) {
    return new Target(TargetType.SHIP, target._objid)
  } else if (target instanceof Planet) {
    return new Target(TargetType.GAMEOBJECT, target._objid)
  } else if (target instanceof Sylvester.Vector) {
    return new Target(TargetType.POSITION, target)
  } else if (target === TargetType.HALT) {
    return new Target(TargetType.HALT, TargetType.HALT)
  } else if (target === TargetType.IDLE) {
    return new Target(TargetType.IDLE, TargetType.IDLE)
  } else if (target === TargetType.LOST) {
    return new Target(TargetType.LOST, TargetType.LOST)
  } else {
    throw new Error(`Unsupported target type for ${target}`)
  }
}
