import AjaxHandler from '../../util/ajax'
// import AjaxHandler from '../../mock/ajax'
import DOORFORBID from '../../constants/doorForbid'
import Noti from '../../util/noti'

export const CHANGE_DOORFORBID = 'CHANGE_DOORFORBID'
export const changeDoorForbid = (subModule, keyValuePair) => {
  return {
    type: CHANGE_DOORFORBID,
    subModule,
    keyValuePair
  }
}

export const fetchDoorForbidList = (body, subModule) => {
  let { tabIndex } = body
  const clearLoading = dispatch => {
    dispatch({
      type: CHANGE_DOORFORBID,
      subModule,
      keyValuePair: {
        loading: false
      }
    })
  }
  return dispatch => {
    dispatch({
      type: CHANGE_DOORFORBID,
      subModule,
      keyValuePair: {
        loading: true
      }
    })

    let resource = '/api'
    if (tabIndex === DOORFORBID.DOORFORBID_PAGE_TAB_RECORD) {
      resource = DOORFORBID.DOORFORBID_URL.recordList
    } else if (tabIndex === DOORFORBID.DOORFORBID_PAGE_TAB_REPORT) {
      resource = DOORFORBID.DOORFORBID_URL.reportList
    } else if (tabIndex === DOORFORBID.DOORFORBID_PAGE_TAB_TIME) {
      resource = DOORFORBID.DOORFORBID_URL.timeList
    }
    return AjaxHandler.fetch(resource, body, null, null).then(json => {
      console.log(json)

      if (json && json.data) {
        if (tabIndex === DOORFORBID.DOORFORBID_PAGE_TAB_RECORD) {
          dispatch({
            type: CHANGE_DOORFORBID,
            subModule,
            keyValuePair: {
              record_dataSource: json.data.gateRecords,
              record_total: json.data.total,
              record_loading: false
            }
          })
        } else if (tabIndex === DOORFORBID.DOORFORBID_PAGE_TAB_REPORT) {
          dispatch({
            type: CHANGE_DOORFORBID,
            subModule,
            keyValuePair: {
              report_dataSource: json.data.gateReports,
              report_total: json.data.total,
              report_loading: false
            }
          })
        } else if (tabIndex === DOORFORBID.DOORFORBID_PAGE_TAB_TIME) {
          dispatch({
            type: CHANGE_DOORFORBID,
            subModule,
            keyValuePair: {
              timeSetting_dataSource: json.data.gateTimes,
              timeSetting_total: json.data.total,
              timeSetting_loading: false
            }
          })
        }
      } else {
        clearLoading(dispatch)
      }
    })
  }
}

export const fetchBuildings = (id, props, subModule) => {
  let schoolId = parseInt(id, 10)
  const body = {
    page: 1,
    size: 1000,
    schoolId: schoolId,
    residenceLevel: 1
  }
  let resource = '/api/residence/list'
  const cb = json => {
    try {
      let data = json.data.residences
      let buildingData = {}
      data.forEach(r => {
        buildingData[r.id] = r.name
      })

      props.changeDoorForbid(subModule, {
        buildingMap: buildingData
      })
    } catch (e) {
      console.log(e)
    }
  }
  AjaxHandler.ajax(resource, body, cb)
}

export const fetchDetailRecordList = (body, subModule) => {}

export const fetchDoorFobidSchoolSettingList = (schoolId, props, subModule) => {
  const body = {
    page: 1,
    size: 1000,
    id: schoolId
  }
  let resource = '/api/gate/time/one'
  const cb = json => {
    try {
      let data = json.data.items
      var newItemList = []
      let selectedDays = []
      data.forEach((r, i) => {
        let itemData = r.items
        // let itemDays = []
        var newItemMap = []

        itemData.forEach((subRecord, index) => {
          selectedDays[index] = subRecord.day
          // itemDays[index] = subRecord.day
          newItemMap.normalTime = subRecord.normalTime
          newItemMap.lateTime = subRecord.lateTime
          newItemMap.notReturnTime = subRecord.notReturnTime
        })
        newItemMap.groupNo = r.groupNo

        newItemList[i] = newItemMap
      })

      props.changeDoorForbid(subModule, {
        buildingMap: newItemList
      })
    } catch (e) {
      console.log(e)
    }
  }
  AjaxHandler.ajax(resource, body, cb)
}

export const checkSchoolTimeRangeExist = (schoolId, callBack) => {
  let resource = '/api/gate/time/check'
  const body = {
    id: schoolId
  }
  const cb = json => {
    if (json.data.result) {
      Noti.hintLock('添加出错', '当前学校已有门禁时间端，请勿重复添加')
      callBack(false)
    } else {
      if (callBack) {
        callBack(true)
      }
    }
  }
  AjaxHandler.ajax(resource, body, cb)
}
export const fetchDoorFobidSchoolSettingCheck = (body, subModule) => {}
// export const fetchUserBackDormDetail = (body, resp) => {}

export const fetchAddSchollTimeRange = (body, callBack) => {
  let resource = '/api/gate/time/save'
  const cb = json => {
    if (callBack) {
      callBack(json.data.result)
    }
  }
  AjaxHandler.ajax(resource, body, cb)
}
