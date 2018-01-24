/* ---------  description ----------- */
/* 1. Used to add/edit privilege info
   2. 'desc' is not checked to be different, so be cautious
   3. 'path' is local name, corresponding to 'paths' of server format
   4. main and sub navs is build from 'store/mainNavs' and 'store/subNavs'. If 'subNavs[i]' is null, fetch.
*/

import React from 'react'
import { Button } from 'antd'
import AjaxHandler from '../../../util/ajax'
import Noti from '../../../util/noti'
import CONSTANTS from '../../component/constants'
import BasicSelector from '../../component/basicSelectorWithoutAll'
import AddPlusAbs from '../../component/addPlusAbs'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { setAuthenData, fetchPrivileges } from '../../../actions'

class AuthenInfo extends React.Component {
  static propTypes = {
    mainNavs: PropTypes.array.isRequired,
    subNavs: PropTypes.object.isRequired,
    originalPrivileges: PropTypes.array.isRequired
  }
  constructor(props) {
    super(props)
    this.state = {
      id: 0,
      mainId: '',
      mainError: false,
      subId: '',
      subError: false,
      oper: '',
      opeError: false,
      desc: '',
      desError: false,
      path: [{ name: '', error: false }],
      pathError: false,
      subItems: {}
    }
  }
  fetchData = body => {
    let resource = '/api/privilege/one'
    const cb = json => {
      let { id, mainId, subId, oper, desc, paths } = json.data
      const nextState = {
        id: id,
        mainId: mainId,
        subId: subId,
        oper: oper,
        desc: desc
      }
      if (paths && paths.length > 0) {
        let path = []
        paths.forEach(p => {
          path.push({
            name: p,
            error: false
          })
        })
        nextState.path = path
      }
      console.log(nextState)
      this.setState(nextState)
      // set subItems for nav
      if (!this.props.subNavs[mainId]) {
        this.fetchNavs({
          parentId: mainId,
          level: 2
        })
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  setMainNavs = navs => {
    let mainNav = {}
    navs.forEach(r => {
      mainNav[r.id] = r.name
    })
    this.mainNav = mainNav
  }
  fetchNavs = body => {
    let resource = '/nav/list'
    const cb = json => {
      let subNavs = JSON.parse(JSON.stringify(this.props.subNavs))
      // add the nav info to the navs of the store
      if (body.level === 1) {
        this.setMainNavs(json.data.navs)
        this.props.setAuthenData({
          mainNavs: json.data.navs
        })
      } else {
        let subItems = {}
        json.data.navs.forEach(r => {
          subItems[r.id] = r.name
        })
        subNavs[body.parentId] = subItems
        console.log(subNavs)
        this.props.setAuthenData({
          subNavs: subNavs
        })
      }
      /* 
      json.data.navs.forEach((r) => {
        if (r.level === 1) {
          let exist = navs.find(n => n.id === r.id)
          if (!exist) {
            r.children = {}
            navs.push(r)
          }
        } else {
          let mainId = navs.find(n => n.id === r.parentId)
          if (mainId) {
            let subId = mainId.children && mainId.children[r.id]
            if (!subId) {
              mainId.children[r.id] = r.name
            }
          }
        }
      })
      */
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  componentDidMount() {
    this.props.hide(false)
    // fetch all the nav info
    const body = {
      level: 1
    }
    if (this.props.mainNavs.length === 0) {
      this.fetchNavs(body)
    } else {
      this.setMainNavs(this.props.mainNavs)
    }

    if (this.props.match.params.id) {
      let id = parseInt(this.props.match.params.id.slice(1), 10)
      const body = {
        id: id
      }
      this.fetchData(body)
    }
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  back = () => {
    this.props.history.goBack()
  }
  postData = () => {
    const { id, subId, oper, desc, path, posting } = this.state
    if (posting) {
      return
    }
    const pathArr = []
    path.forEach(r => {
      if (r.name) {
        pathArr.push(r.name)
      }
    })
    let resource = '/privilege/add'
    const body = {
      navId: parseInt(subId, 10),
      oper: parseInt(oper, 10),
      desc: desc,
      paths: pathArr
    }
    if (id) {
      resource = '/privilege/update'
      body.id = id
    }
    const cb = json => {
      if (json.data.result) {
        // update privileges info of store first
        this.props.fetchPrivileges()
        Noti.hintSuccess(this.props.history, '/employee/authen')
      } else {
        Noti.hintWarning('添加出错', json.data.failReason || '请稍后重试')
      }
    }
    // console.log(body)
    AjaxHandler.ajax(resource, body, cb)
  }
  confirm = () => {
    const { mainId, subId, oper, desc, checking, posting } = this.state
    if (checking || posting) {
      return
    }
    if (!mainId) {
      return this.setState({
        mainError: true
      })
    }
    if (!subId) {
      return this.setState({
        subError: true
      })
    }
    if (!oper) {
      return this.setState({
        opeError: true
      })
    }
    if (!desc) {
      return this.setState({
        desError: true
      })
    }
    let path = JSON.parse(JSON.stringify(this.state.path))
    for (let i = 0; i < path.length; i++) {
      let r = path[i]
      if (!r.name) {
        r.error = true
        return this.setState({
          path: path
        })
      }
    }
    this.postData()
  }
  changeMain = v => {
    this.setState({
      mainId: v
    })
    if (v) {
      let { subNavs } = this.props
      let id = parseInt(v, 10)
      let subItems = subNavs[id]
      if (!subItems) {
        this.fetchNavs({
          level: 2,
          parentId: id
        })
      }
    }
  }
  checkMain = v => {
    if (!v) {
      this.setState({
        mainError: false
      })
    } else if (this.state.mainError) {
      this.setState({
        mainError: false
      })
    }
  }
  changeSub = v => {
    this.setState({
      subId: v
    })
  }
  checkSub = v => {
    if (!v) {
      this.setState({
        subError: false
      })
    } else if (this.state.subError) {
      this.setState({
        subError: false
      })
    }
  }
  changeOpe = v => {
    this.setState({
      oper: v
    })
  }
  checkOpe = v => {
    if (!v) {
      this.setState({
        opeError: true
      })
    } else if (this.state.opeError) {
      this.setState({
        opeError: false
      })
    }
  }
  changeDes = e => {
    this.setState({
      desc: e.target.value
    })
  }
  checkDes = e => {
    let v = e.target.value.trim()
    if (!v) {
      return this.setState({
        desError: true,
        desc: v
      })
    }
    if (this.state.desError) {
      this.setState({
        desError: false,
        desc: v
      })
    }
  }
  changePath = (e, i) => {
    let v = e.target.value
    let path = JSON.parse(JSON.stringify(this.state.path))
    path[i].name = v
    this.setState({
      path: path
    })
  }
  checkPath = (e, i) => {
    let v = e.target.value.trim()
    let path = JSON.parse(JSON.stringify(this.state.path))
    if (!v) {
      path[i].error = true
    } else {
      path[i].error = false
    }
    path[i].name = v
    this.setState({
      path: path
    })
  }
  add = () => {
    let path = JSON.parse(JSON.stringify(this.state.path))
    path.push({ name: '', error: false })
    this.setState({
      path: path
    })
  }
  abstract = () => {
    let path = JSON.parse(JSON.stringify(this.state.path))
    path.pop()
    this.setState({
      path: path
    })
  }

  render() {
    const {
      id,
      mainId,
      mainError,
      subId,
      subError,
      oper,
      opeError,
      desc,
      desError,
      path
    } = this.state
    const { subNavs } = this.props
    const pathItems =
      path &&
      path.map((r, i) => {
        return (
          <div key={`path${i}`}>
            <input
              value={r.name}
              className="longInput"
              onChange={e => {
                this.changePath(e, i)
              }}
              onBlur={e => {
                this.checkPath(e, i)
              }}
            />
            {r.error ? (
              <span className="checkInvalid">链接不能为空！</span>
            ) : null}
          </div>
        )
      })

    return (
      <div className="infoList authenInfo">
        <ul>
          <li>
            <p>主导航:</p>
            <BasicSelector
              invalidTitle=""
              width={CONSTANTS.SELECTWIDTH}
              staticOpts={this.mainNav || {}}
              selectedOpt={mainId}
              disabled={id}
              className={id ? 'disabled' : ''}
              changeOpt={this.changeMain}
              checkOpt={this.checkMain}
            />
            {mainError ? (
              <span className="checkInvalid">请选择主导航！</span>
            ) : null}
          </li>
          <li>
            <p>子导航:</p>
            <BasicSelector
              invalidTitle=""
              width={CONSTANTS.SELECTWIDTH}
              staticOpts={subNavs[parseInt(mainId, 10)] || {}}
              selectedOpt={subId}
              disabled={id}
              className={id ? 'disabled' : ''}
              changeOpt={this.changeSub}
              checkOpt={this.checkSub}
            />
            {subError ? (
              <span className="checkInvalid">请选择子导航！</span>
            ) : null}
          </li>
          <li>
            <p>权限类型:</p>
            <BasicSelector
              width={CONSTANTS.SELECTWIDTH}
              selectedOpt={oper}
              changeOpt={this.changeOpe}
              checkOpt={this.checkOpe}
              staticOpts={CONSTANTS.AuthenOpeType}
              invalidTitle=""
            />
            {opeError ? (
              <span className="checkInvalid">请选择类型！</span>
            ) : null}
          </li>
          <li>
            <p>权限名称:</p>
            <input
              value={desc}
              className="longInput"
              onChange={this.changeDes}
              onBlur={this.checkDes}
            />
            {desError ? (
              <span className="checkInvalid">名称不能为空！</span>
            ) : null}
          </li>
          <li className="itemsWrapper">
            <p>链接:</p>
            <div>
              {pathItems}
              <AddPlusAbs
                count={path.length}
                add={this.add}
                abstract={this.abstract}
              />
            </div>
          </li>
        </ul>
        <div className="btnArea">
          <Button type="primary" onClick={this.confirm}>
            确认
          </Button>
          <Button onClick={this.back}>返回</Button>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  mainNavs: state.setAuthenData.mainNavs,
  subNavs: state.setAuthenData.subNavs,
  originalPrivileges: state.setAuthenData.originalPrivileges
})

export default withRouter(
  connect(mapStateToProps, {
    setAuthenData,
    fetchPrivileges
  })(AuthenInfo)
)
