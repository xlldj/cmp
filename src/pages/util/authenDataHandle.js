import Noti from '../noti'
import CONSTANTS from '../component/constants'
const privilege2Url = CONSTANTS.PRIVILEGE2URL
const OPETYPES = CONSTANTS.AuthenOpeType

export function buildAuthenData (data, selected) {
  /* count: count of authentication items, for style */
  /*   key: to facilitate the handle of click event in ahthen table */
  console.log(data)
  // debugger
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
        // debugger
        if (operBlock) {
          // current sub has the operation block
          operBlock.count++
          operBlock.children.push({
            name: r.desc,
            id: authenId,
            key: operBlock.key + (operBlock.length + 1),
            level: 4,
            selected: selected || false
          })
        } else {
          // push a operation block into sub
          let sl = subBlock.children.length + 1
          subBlock.children.push({
            name: OPETYPES[oper],
            opeType: oper,
            key: subBlock.key + '-' + sl,
            level: 3,
            selected: selected || false,
            count: 1,
            children: [
              {
                name: r.desc,
                id: authenId,
                key: subBlock.key + '-' + sl + '-1',
                level: 4,
                selected: selected || false
              }
            ]
          })
        }
      } else {
        // push a sub into main
        let ml = mainBlock.children.length + 1
        mainBlock.children.push({
          name: r.subName,
          id: subId,
          key: mainBlock.key + '-' + ml,
          level: 2,
          selected: selected || false,
          count: 1,
          children: [
            {
              name: OPETYPES[oper],
              opeType: oper,
              key: mainBlock.key + '-' + ml + '-1',
              level: 3,
              selected: selected || false,
              count: 1,
              children: [
                {
                  name: r.desc,
                  id: authenId,
                  key: mainBlock.key + '-' + ml + '-1-1',
                  level: 4,
                  selected: selected || false
                }
              ]
            }
          ]
        })
      }
    } else {
      // push a main into status
      let l = status.length + 1
      status.push({
        name: r.mainName,
        id: mainId,
        key: l,
        level: 1,
        selected: selected || false,
        count: 1,
        children: [
          {
            name: r.subName,
            id: subId,
            key: l + '-1',
            level: 2,
            selected: selected || false,
            count: 1,
            children: [
              {
                name: OPETYPES[oper],
                opeType: oper,
                key: l + '-1-1',
                level: 3,
                selected: selected || false,
                count: 1,
                children: [
                  {
                    name: r.desc,
                    id: authenId,
                    key: l + '-1-1-1',
                    level: 4,
                    selected: selected || false
                  }
                ]
              }
            ]
          }
        ]
      })
    }
  })
  return status
}

// build current user's authentication status, only has selected items
export function buildCurrentAuthen (data) {
  if (data.length === 0) {
    return
  }
  let status = buildAuthenData(data, true)
  return status
}

// build a array which contains forbidden url
export function buildForbiddenUrl (full, current) {
  if (!full || full.length === 0) {
    return
  }
  if (!current || current.length === 0) {
    return
  }
  try {
    let forbidden = full.forEach((r) => {
      let found = current.find(rec => rec.id === r.id)
      if (found) {
        return false
      } else {
        return true
      }
    })
    let forbiddenUrls = []
    forbidden.forEach((r) => {
      console.log(privilege2Url[r.desc])
      let urls = privilege2Url[r.desc]
      urls.forEach((u) => {
        forbiddenUrls.push(u)
      })
    })
    return forbiddenUrls
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

export function updatePrivilege (data, status) {
  // data is a full privelege table, status is the info need to be added
  if (!data || !status) {
    return
  }
  status.forEach((r) => {
    let mainId = r.mainId, subId = r.subId, oper = r.oper, authenId = r.id
    let mainBlock = data.find(s => s.id === mainId)
    if (mainBlock) {
      // status has the mainId
      mainBlock.selected = true
      let subBlock = mainBlock.children.find(sub => sub.id === subId)
      if (subBlock) {
        subBlock.selected = true
        // current main block has the sub
        let operBlock = subBlock.children && subBlock.children.find(o => o.opeType === oper)
        if (operBlock) {
          operBlock.selected = true
          // current sub has the operation block
          let authen = operBlock.find(x => x.id === authenId)
          if (authen) {
            authen.selected = true
          }
        }
      }
    }
  })
  return data
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
