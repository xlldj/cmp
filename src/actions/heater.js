import AjaxHandler from '../util/ajax'
import CONSTANTS from '../constants'
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
  let { page, schoolId, heaterStatus } = newProps
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
      // heaterStatus: heaterStatus
    }

    if (heaterStatus === 2 && schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    let resource = '/api/heater/list'
    const cb = json => {
      dispatch({
        type: CHANGE_HEATER,
        subModule: 'heaterList',
        keyValuePair: {
          dataSource: json.data.heaters,
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
