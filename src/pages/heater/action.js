// import AjaxHandler from '../../util/ajax'
import AjaxHandler from '../../mock/ajax'
import CONSTANTS from '../../constants'
const { PAGINATION } = CONSTANTS

export const CHANGE_HEATER = 'CHANGE_HEATER'
export const changeHeater = (subModule, keyValuePair) => {
  return {
    type: CHANGE_HEATER,
    subModule,
    keyValuePair
  }
}

export const fetchHeaterList = newProps => {
  let { page, schoolId, tabIndex } = newProps
  const clearLoading = dispatch => {
    dispatch({
      type: CHANGE_HEATER,
      subModule: 'heaterList',
      keyValuePair: {
        loading: false
      }
    })
  }
  return dispatch => {
    dispatch({
      type: CHANGE_HEATER,
      subModule: 'heaterList',
      keyValuePair: {
        loading: true
      }
    })

    const body = {
      page: page,
      size: PAGINATION
      // tabIndex: tabIndex
    }

    if (tabIndex === 2 && schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    let resource = '/api/machine/unit/list'
    const cb = json => {
      dispatch({
        type: CHANGE_HEATER,
        subModule: 'heaterList',
        keyValuePair: {
          dataSource: json.data.machineUnits,
          total: json.data.total,
          loading: false
        }
      })
    }

    return AjaxHandler.ajax(resource, body, cb, null, null, () => {
      clearLoading(dispatch)
    })
  }
}
