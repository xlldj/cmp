import AjaxHandler from '../util/ajax'

export const SET_BUILDING_LIST = 'SET_BUILDING_LIST'
export const SET_RESIDENCE_LIST = 'SET_RESIDENCE_LIST'

let loading = false
export const fetchBuildings = schoolId => {
  return dispatch => {
    if (loading) {
      return
    }
    loading = true
    const resource = '/api/residence/list'
    const body = {
      page: 1,
      size: 1000,
      schoolId: +schoolId,
      residenceLevel: 1
    }
    AjaxHandler.fetch(resource, body).then(json => {
      if (loading) {
        loading = false
      }
      if (json && json.data) {
        // set data into store
        const value = {}
        value[+schoolId] = json.data.residences
        dispatch({
          type: SET_BUILDING_LIST,
          subModule: 'buildingsOfSchoolId',
          value
        })
      }
    })
  }
}

export const fetchResidence = schoolId => {
  return dispatch => {
    const resource = '/api/residence/list'
    const body = {
      page: 1,
      size: 1000,
      schoolId: +schoolId
    }
    AjaxHandler.fetch(resource, body).then(json => {
      if (json && json.data) {
        const value = {}
        value[+schoolId] = json.data.residences
        dispatch({
          type: SET_RESIDENCE_LIST,
          subModule: 'residenceOfSchoolId',
          value
        })
      }
    })
  }
}
