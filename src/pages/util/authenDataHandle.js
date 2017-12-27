import Noti from '../noti'
import CONSTANTS from '../component/constants'
const privilege2Url = CONSTANTS.PRIVILEGE2URL
const OPETYPES = CONSTANTS.AuthenOpeType

export function buildAuthenData (data, selected) {
  /* count: count of authentication items, for style */
  /*   key: to facilitate the handle of click event in ahthen table */
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
        if (operBlock) {
          // current sub has the operation block
          operBlock.count++
          operBlock.children.push({
            name: r.desc,
            id: authenId,
            key: operBlock.key + '-' + (operBlock.children.length + 1),
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

// build authen status based on full. Such as in roleInfo.js, employeeInfo.js
// 'data' is a constructed authen structure like in buildAuthenData()
// 'status' is a array of selected privileges, fetched from server,
export function buildAuthenBaseOnfull (data, status) {
  let full = JSON.parse(JSON.stringify(data))
  console.log(full)
  console.log(status)
  // debugger
  status.forEach(s => {
    let mainBlock = full.find(m => m.id === s.mainId)
    if (mainBlock && mainBlock.children) {
      mainBlock.selected = true
      let subBlock = mainBlock.children.find(sub => sub.id === s.subId)
      if (subBlock && subBlock.children) {
        subBlock.selected = true
        let operBlock = subBlock.children.find(o => o.opeType === s.oper)
        if (operBlock && operBlock.children) {
          operBlock.selected = true
          let item = operBlock.children.find(a => a.id === s.id)
          item.selected = true
        }
      }
    }
  })
  return full
}
// build a array which contains forbidden url
// 'full' and 'current' are some structure: flatten object array directly from server.
export function buildForbiddenUrl (full, current) {
  if (!full || full.length === 0) {
    return
  }
  if (!current || current.length === 0) {
    return
  }
  try {
    let forbidden = full.filter((r) => {
      let found = current.find(rec => rec.id === r.id)
      if (found) {
        return false
      } else {
        return true
      }
    })
    let forbiddenUrls = []
    forbidden.forEach((r) => {
      // console.log(privilege2Url[r.desc])
      let urls = privilege2Url[r.desc]
      if (urls) {
        forbiddenUrls = forbiddenUrls.concat(urls)
      }
    })
    return forbiddenUrls
  } catch (e) {
    console.log(e)
    Noti.hintProgramError()
  }
}

export function buildForbiddenStatus (full, current) {
  let desc2status = CONSTANTS.DESC2STATUS
  let forbiddenStatus = {}
  // find all the forbidden items
  if (current && current.length > 0 && full && full.length > 0) {
    let forbidden = full.filter((r) => {
      let found = current.find(rec => rec.id === r.id)
      if (found) {
        return false
      } else {
        return true
      }
    })
    // if need to set in store/setAuthenData.forbiddenStatus, set it
    forbidden.forEach(p => {
      if (desc2status[p.desc]) {
        let key = desc2status[p.desc]
        forbiddenStatus[key] = true
      }
    })
    return forbiddenStatus
  }
}

// used in authenInfo
// build previleges data for server
export function buildAuthenDataForServer (status) {
  const result = []
  // debugger
  status.forEach(main => {
    if (main.children) {
      main.children.forEach(sub => {
        if (sub.children) {
          sub.children.forEach(oper => {
            if (oper.children) {
              oper.children.forEach(item => {
                if (item.selected) {
                  result.push(item.id)
                }
              })
            }
          })
        }
      })
    }
  })
  return result
}

export function updatePrivilege (full, status) {
  // data is a full privelege table, status is the info need to be added
  let data = JSON.parse(JSON.stringify(full))
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
