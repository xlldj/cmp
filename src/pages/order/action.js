export const CHANGE_ORDER = 'CHANGE_ORDER'
export const changeOrder = (subModule, keyValuePair) => {
  return {
    type: CHANGE_ORDER,
    subModule,
    keyValuePair
  }
}
