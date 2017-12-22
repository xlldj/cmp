import Noti from '../noti'
import CONSTANTS from '../component/constants'
const rootName2Url = CONSTANTS.ROOTNAME2URL
const SUBNAME2URL = CONSTANTS.SUBNAME2URL
const OPETYPES = CONSTANTS.OPETYPES

export function buildAuthenData (data, selected) {
  /* count: count of authentication items, for style */
  /*   key: to facilitate the handle of click event in ahthen table */  
  if (!data) {
    return
  }
  let status = []
  data.forEach((r, i) => {
    let mainId = r.mainId, subId = r.subId, oper = r.oper, authenId = r.id
    let mainBlock = status.find(s => s.id === mainId)
    if (mainBlock) {
      // status has the mainId
      mainBlock.count++
      let subBlock = mainBlock.children.find(sub => sub.id === subId)
      if (subBlock) {
        // current main block has the sub
        subBlock.count++
        let operBlock = subBlock.children && subBlock.children.find(o => o.opeType === oper)
        if (operBlock) {
          // current sub has the operation block
          operBlock.count++
          operBlock.push({
            name: r.desc,
            id: authenId,
            key: operBlock.key + (operBlock.length + 1),
            level: 4,
            selected: selected ? selected : false
          })
        } else {
          // push a operation block into sub
          subBlock.children.push({
            name: OPETYPES[oper],
            opeType: oper,
            key: subBlock.key + (subBlock.children.length + 1),
            level: 3,
            selected: selected ? selected : false,
            count: 1,
            children: []
          })
        }
      } else {
        // push a sub into main
        mainBlock.push({
          name: r.subName,
          id: subId,
          key: mainBlock.key + '-' + (mainBlock.children.length + 1),
          level: 2,
          selected: selected ? selected : false,
          count: 1,
          children: []
        })
      }
    } else {
      // push a main into status
      status.push({
        name: r.mainName,
        id: mainId,
        key: (i + 1).toString(),
        level: 1, 
        selected: selected ? selected : false,
        count: 1,
        children: []
      })
    }
  })
  return status
}

// build current user's authentication status, only has selected items
export function buildCurrentAuthen (data) {
  let status = buildAuthenData(data, true)
  return status
}

// build a real authentication data, has all the items and set selected for each
export function buildRealAuthen (full, status) {
  // data is the full data, status is real authentication data(server format)
  try {
    let data = JSON.parse(JSON.stringify(full))
    status.forEach((r) => {
      let mainBlock = data.find(rec => rec.id === r.mainId)
      mainBlock.selected = true
      let subBlock = mainBlock.find(rec => rec.id === r.subId)
      subBlock.selected = true
      let operBlock = subBlock.find(rec => rec.opeType === r.oper)
      operBlock.selected = true
      let authenItem = operBlock.find(rec => rec.id === r.id)
      authenItem.selected = true
    })
    return data
  } catch (e) {
    console.log(e)
    Noti.hintProgramError()
  }
}

// build previleges data for server
export function buildAuthenDataForServer (status) {
  let data = []
  const buildItem = (model) => {
    if (model.children) {
      model.children.forEach((r) => {
        buildItem(r)
      })
    } else {
      data.push(model.id)
    }
  }
  data = buildItem(status)
  let result = []
  data.forEach((r) => {
    if (r.selected) {
      result.push(r.id)
    }
  })
  return result
}

/*
export function buildReadableAuthen (data) {
  let status = {}
  data.forEach((r) => {
    // let rootUrl = rootName2Url(r.mainName), subUrl = subName2Url(r.subName)
    if (status[rootUrl]) {

    }
  })
}
*/