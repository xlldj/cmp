import { moduleActionFactory } from '../../actions/moduleActions.js'

export const CHANGE_NOTIFY = 'CHANGE_NOTIFY'
export const changeNotify = (subModule, keyValuePair) => {
  return dispatch =>
    moduleActionFactory(dispatch, 'NOTIFY', subModule, keyValuePair)
}
