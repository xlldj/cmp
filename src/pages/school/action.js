import AjaxHandler from '../../util/ajax'
import store from '../../index.js'

export const CHANGE_SCHOOL = 'CHANGE_SCHOOL'
export const changeSchool = (subModule, keyValuePair) => {
  return {
    type: CHANGE_SCHOOL,
    subModule,
    keyValuePair
  }
}

export const CHANGE_OVERVIEW = 'CHANGE_OVERVIEW'
export const fetchOverviewData = body => {
  const { overviewModal } = store.getState()
  const { listLoading } = overviewModal
  return dispatch => {
    if (listLoading) {
      return
    }
    dispatch({
      type: CHANGE_OVERVIEW,
      value: {
        listLoading: true
      }
    })
    let resource = '/school/full/list'
    return AjaxHandler.fetch(resource, body).then(json => {
      let value = {
        listLoading: false
      }
      if (json && json.data) {
        const { total, schools } = json.data
        const ds = schools.map((record, index) => {
          record.key = record.id
          return record
        })
        value = {
          ...value,
          ...{
            list: ds,
            total
          }
        }
      }
      dispatch({
        type: CHANGE_OVERVIEW,
        value: value
      })
    })
  }
}
