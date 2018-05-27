export const CHANGE_LOST = 'CHANGE_LOST'
export const moduleActionFactory = (
  dispatch,
  moduleName,
  subModule,
  keyValuePair
) => {
  const type = 'CHANGE_' + moduleName.toUpperCase()
  dispatch({
    type,
    subModule,
    keyValuePair
  })
}
