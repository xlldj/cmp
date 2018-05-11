import { moduleActionFactory } from '../../actions/moduleActions.js'
export const CHANGE_LOST = 'CHANGE_LOST'

/**
 * 更改reducer@lostModule 的通用action
 * @param {string} subModule      :reducer@lostModule中对应的根状态名
 * @param {Object} keyValuePair   :传入待更改的键值对
 */
export const changeLost = (subModule, keyValuePair) => {
  return dispatch =>
    moduleActionFactory(dispatch, 'LOST', subModule, keyValuePair)
}
