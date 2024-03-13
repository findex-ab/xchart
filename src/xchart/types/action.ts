export enum EActionType {
  UPDATE = 'UPDATE'
}

export type IAction = {
  type: EActionType;
  instanceUid: string;
}
