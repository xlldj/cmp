export const CHANGE_USER = 'CHANGE_USER'
export const changeUser = (subModule, keyValuePair) => {
  return {
    type: CHANGE_USER,
    subModule,
    keyValuePair
  }
}
