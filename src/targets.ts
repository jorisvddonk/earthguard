import Planet from './planet'
import Ship from './ship'
import Sylvester from './sylvester-withmods'

export enum TargetType {
  GAMEOBJECT,
  POSITION,
  NULL,
  HALT,
}

export type TargetF = Ship | Planet | Sylvester.Vector | TargetType.HALT

export class Target {
  public targetType: TargetType
  public target: TargetF

  constructor(targetType: TargetType, target: TargetF) {
    this.target = target
    this.targetType = targetType
  }
}
