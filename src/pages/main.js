/* state description */
/* build flow
    1. fetch schools for school selector
    2. check if authentication status is set, if not, read from sessionStorage. If still false, hint relog again
    3. use 'forbiddenUrls' to control if show some url. This prop is set along with authentication info. So It will always exist in when update
*/

import React from 'react'
import { Route, Redirect, Link, withRouter } from 'react-router-dom'
import { asyncComponent } from './component/asyncComponent'
import { Layout, Dropdown, Menu, Badge } from 'antd'
import MyMenu from './nav/myMenu'
import userImg from './assets/user.png'
import logo from './assets/logo.png'
import { getLocal, setLocal, removeLocal, getStore } from './../util/storage'
import AjaxHandler from '../util/ajax'
import Noti from './../util/noti'
import { removeStore } from './../util/storage'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  changeSchool,
  changeDevice,
  changeOrder,
  changeFund,
  changeGift,
  changeLost,
  changeUser,
  changeTask,
  changeEmployee,
  changeNotify,
  changeVersion,
  changeStat,
  setSchoolList,
  setAuthenData,
  fetchPrivileges,
  setUserInfo,
  changeOnline,
  changeOffline
} from '../actions'
import { heartBeat, stopBeat } from '../tasks/heartBeat'

import DeviceDisp from './device/deviceDisp'

const REFRESHTIMEOUT = 5000
const Welcome = asyncComponent(() =>
  import(/* webpackChunkName: "welcome" */ './welcome/welcome')
)
const SchoolDisp = asyncComponent(() =>
  import(/* webpackChunkName: "school" */ './school/schoolDisp')
)
const DoorForbidDisp = asyncComponent(() =>
  import(/* webpackChunkName: "doorForbid" */ './doorForbid/doorForbidDisp')
)
const OrderDisp = asyncComponent(() =>
  import(/* webpackChunkName: "order" */ './order/orderDisp')
)
const FundDisp = asyncComponent(() =>
  import(/* webpackChunkName: "fund" */ './fund/fundDisp')
)
const GiftDisp = asyncComponent(() =>
  import(/* webpackChunkName: "gift" */ './gift/giftDisp')
)
const LostDisp = asyncComponent(() =>
  import(/* webpackChunkName: "lost" */ './lost/lostDisp')
)
const EmployeeDisp = asyncComponent(() =>
  import(/* webpackChunkName: "employee" */ './employee/employeeDisp')
)
const TaskDisp = asyncComponent(() =>
  import(/* webpackChunkName: "task" */ './task/taskDisp')
)
const StatDisp = asyncComponent(() =>
  import(/* webpackChunkName: "stat" */ './stat/statDisp')
)
const UserDisp = asyncComponent(() =>
  import(/* webpackChunkName: "user" */ './user/userDisp')
)
const NotifyDisp = asyncComponent(() =>
  import(/* webpackChunkName: "notify" */ './notify/notifyDisp')
)
const AccountInfo = asyncComponent(() =>
  import(/* webpackChunkName: "account" */ './account/accountInfo')
)
const VersionDisp = asyncComponent(() =>
  import(/* webpackChunkName: "version" */ './version/versionDisp')
)

const { Content } = Layout
const ONLINE = {
  1: true,
  2: false
}

class Main extends React.Component {
  static propTypes = {
    schools: PropTypes.array.isRequired,
    recent: PropTypes.array.isRequired,
    schoolSet: PropTypes.bool.isRequired,
    forbiddenUrls: PropTypes.array.isRequired,
    authenSet: PropTypes.bool.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      hasChildren: true,
      showForbidden: false,
      tiForForbid: null,
      ti: null,
      forbiddenUrl: ''
    }
    this.onlineMenu = (
      <Menu
        style={{ zIndex: 9999 }}
        selectable={false}
        onClick={this.changeOnline}
      >
        <Menu.Item className="onlineOption" key={1}>
          <Badge className="onlineOption" status="success" text="在线" />
        </Menu.Item>
        <Menu.Item className="onlineOption" key={2}>
          <Badge status="default" text="离线" />
        </Menu.Item>
      </Menu>
    )
  }
  changeOnline = e => {
    if (e.key) {
      let { csOnline } = this.props.user
      let online = +e.key
      if (ONLINE[online] === csOnline) {
        return
      }
      this.postOnlineStatus(ONLINE[online])
    }
  }

  // force offline, even if there is still unhandled task.
  forceOffline = () => {
    this.props.changeOffline(true)
  }
  // cancel offline.
  cancelOffline = () => {
    // nothing.
  }
  // tell user still exist unhandled task
  NotiRemain = () => {
    Noti.clickForYesOrNo(
      '确定要下线么?',
      '当前还有未处理工单',
      this.forceOffline,
      this.cancelOffline
    )
  }
  // callback of click 'online/offline' event.
  postOnlineStatus = (online, hint) => {
    // operation of change online status is in 'actions/index.js'
    if (online) {
      this.props.changeOnline()
    } else {
      // First, don't force offline. If there is still unhandled task, tell the user.
      this.props.changeOffline(false, this.NotiRemain)
    }
  }
  clearOnline = () => {
    console.log('clear')
    // if is custom and still online, change to online.
    let { isCs, csOnline } = this.props.user
    if (isCs && csOnline) {
      this.postOnlineStatus(false, false)
    }
  }

  componentDidMount() {
    // clear online status when window is closed.
    // can't clear, it will offline when user refresh.
    // window.onbeforeunload = this.clearOnline;
    this.ti = null

    // set school list globally
    this.props.setSchoolList({
      schoolSet: false,
      schools: [],
      recent: []
    })
    this.fetchSchools()

    // set user online info.
    let online = getStore('online')
    if (online) {
      this.props.setUserInfo({
        csOnline: true
      })
      // start heart beat again.
      heartBeat()
    }

    // Set authen info globally
    // Typically, 'authenSet' should be true(it's set when login).
    // If browser refreshed, store may be cleared thus need to be read from sessionStorage
    // Or if sessiongStorage is null, it should be 'refresh but did not log after version change'. Hint to log again.
    try {
      let { authenSet } = this.props
      if (!authenSet) {
        let authenInfo = JSON.parse(getStore('authenInfo'))
        // console.log(authenInfo)
        if (authenInfo) {
          authenInfo.authenSet = true
          this.props.setAuthenData(authenInfo)
          // console.log(authenInfo)
        } else {
          this.hintRelog()
          // this.props.fetchPrivileges()
        }
      }
    } catch (e) {
      console.log(e)
      Noti.hintProgramError()
    }

    this.props.hide(false)
  }
  hintRelog = () => {
    const logout = () => {
      removeStore('logged')
      removeStore('schoolLimit')
      window.location.assign('/')
    }
    Noti.hintAndClick(
      '您的账户已在别的地方登录',
      '您将被强制退出，请重新登录',
      logout
    )
  }
  componentWillUnmount() {
    // Noti.hintWarning('eror', 'test');
    this.props.hide(true)
    if (this.state.ti) {
      clearTimeout(this.state.ti)
    }
    if (this.state.tiForForbid) {
      clearTimeout(this.tiForForbid)
    }
    /* can't offline here, it will offline the customer when refresh the browser.
    // offline when 'main' will unmount, this happens when user logged out without click 'offline'
    let { isCs, csOnline } = this.props.user;
    if (isCs && csOnline) {
      this.postOnlineStatus(false, false);
    }
    */
  }
  shouldComponentUpdate(nextProps, nextState) {
    // url control. if next location is a forbidden url , stop update
    let nextLocation = nextProps.history.location.pathname
    let { forbiddenUrls } = this.props
    try {
      let forbidden = forbiddenUrls.findIndex(r => {
        if (nextLocation.includes(r)) {
          return true
        } else {
          return false
        }
      })
      if (forbidden !== -1) {
        // return false
        // if not showing forbidden, and nextLocation !== this.state.forbiddenUrl, show it. Trigger a timer to avoid duplicate show
        if (!this.state.showForbidden && nextLocation !== this.forbiddenUrl) {
          Noti.hintWarning('访问受限', '您没有访问该页面的权限')
          let tiForForbid = setTimeout(this.clearShowForbidden, 2000)
          this.setState({
            tiForForbid: tiForForbid,
            showForbidden: true
          })
          this.forbiddenUrl = nextLocation
        }
        return false
      } else {
        this.forbiddenUrl = ''
        return true
      }
    } catch (e) {
      console.log(e)
      return true
    }
  }

  clearShowForbidden = () => {
    if (this.tiForForbid) {
      clearTimeout(this.tiForForbid)
    }
    this.setState({
      showForbidden: false,
      tiForForbid: null
    })
  }

  fetchSchools = () => {
    let resource = '/school/list'
    const body = {
      page: 1,
      size: 1000
    }
    const cb = json => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        if (json.data) {
          let recentSchools = getLocal('recentSchools'),
            defaultSchool = getLocal('defaultSchool'),
            selectedSchool = 'all',
            recent = []
          if (recentSchools) {
            let localRecentArray = recentSchools.split(',')
            localRecentArray.forEach(r => {
              let index = json.data.schools.findIndex(
                s => s.id === parseInt(r, 10)
              )
              if (index !== -1) {
                recent.push(json.data.schools[index])
              }
            })
            if (recent.length > 0) {
              selectedSchool = recent[0].id.toString()
              let recentIds = recent && recent.map(r => r.id)
              setLocal('recentSchools', recentIds.join(','))
            }
          } else if (defaultSchool) {
            let school = json.data.schools.find(
              s => s.id === parseInt(defaultSchool, 10)
            )
            if (school) {
              selectedSchool = school.id.toString()
            }
          }
          if (selectedSchool === 'all') {
            removeLocal('recentSchools')
            selectedSchool = json.data.schools[0].id.toString()
            setLocal('defaultSchool', selectedSchool)
          }

          this.props.changeSchool('schoolList', { schoolId: selectedSchool })
          this.props.changeSchool('overview', { schoolId: selectedSchool })
          this.props.changeDevice('deviceList', { schoolId: selectedSchool })
          this.props.changeDevice('prepay', { schoolId: selectedSchool })
          this.props.changeDevice('timeset', { schoolId: selectedSchool })
          this.props.changeDevice('rateSet', { schoolId: selectedSchool })
          this.props.changeDevice('rateLimit', { schoolId: selectedSchool })
          this.props.changeDevice('repair', { schoolId: selectedSchool })
          this.props.changeOrder('orderList', { schoolId: selectedSchool })
          this.props.changeOrder('abnormal', { schoolId: selectedSchool })
          this.props.changeFund('fundList', { schoolId: selectedSchool })
          this.props.changeFund('cashtime', { schoolId: selectedSchool })
          this.props.changeFund('charge', { schoolId: selectedSchool })
          this.props.changeFund('deposit', { schoolId: selectedSchool })
          this.props.changeFund('abnormal', { schoolId: selectedSchool })
          this.props.changeGift('act', { schoolId: selectedSchool })
          this.props.changeLost('lostListContainer', {
            schoolId: selectedSchool
          })
          this.props.changeUser('userList', { schoolId: selectedSchool })
          /*
          this.props.changeTask('taskList', {schoolId: selectedSchool}) 
          this.props.changeTask('log', {schoolId: selectedSchool})
          this.props.changeTask('complaint', {schoolId: selectedSchool})
          this.props.changeTask('feedback', {schoolId: selectedSchool})
          */
          this.props.changeStat('overview', { schoolId: selectedSchool })
          this.props.changeStat('charts', { schoolId: selectedSchool })
          this.props.changeStat('rank', { schoolId: selectedSchool })

          this.props.setSchoolList({
            schoolSet: true,
            recent: recent,
            schools: json.data.schools
          })
        } else {
          throw new Error('网络出错，请稍后重试～')
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }

  logout = () => {
    // whether is customer, stop beat.
    stopBeat()
    this.props.logout()
  }
  hide = v => {
    // debugger
    // hide means if to hide the main content or not
    /**
     * @2018/4/10
     * no longer set ti in state, to keep it immediately change other than set it as a batch.
     */
    let loading = this.refs.contentLoading
    if (v) {
      // loading , need to show the loading div
      loading && loading.classList.remove('hide')
      // if wait for more than 5s, refresh the web
      // this.ti = setTimeout(this.refresh, REFRESHTIMEOUT)
    } else {
      // add 'hide' to not display loading
      loading && loading.classList.add('hide')
      if (this.ti) {
        clearTimeout(this.ti)
      }
      this.ti = null
    }
  }
  refresh = () => {
    let { pathname } = this.props.history.location
    window.location.assign(pathname)
  }
  changeWidth = hasChildren => {
    this.setState({
      hasChildren: hasChildren
    })
  }
  render() {
    let { isCs, csOnline, name } = this.props.user
    return (
      <div className="container">
        <div className="nav">
          <div className="sideWrapper">
            <Link to="/welcome">
              <div className="logo">
                <img src={logo} alt="" />
              </div>
            </Link>

            <MyMenu changeWidth={this.changeWidth} />
          </div>
        </div>

        <Layout>
          <Content className="content">
            {isCs ? (
              <Dropdown overlay={this.onlineMenu} trigger={['click']}>
                <span id="onlineStatus">
                  {csOnline ? (
                    <Badge status="success" text="在线" />
                  ) : (
                    <Badge status="default" text="离线" />
                  )}
                </span>
              </Dropdown>
            ) : null}
            <Link id="loggedInfo" to="/account">
              <span>{name}</span>
              <img src={userImg} alt="" />
            </Link>
            <div className="loading" ref="contentLoading">
              加载中...
            </div>
            <div className="main">
              <Route
                path="/welcome"
                render={props => <Welcome hide={this.hide} {...props} />}
              />
              <Route
                path="/school"
                render={props => <SchoolDisp hide={this.hide} {...props} />}
              />
              <Route
                path="/doorForbid"
                render={props => <DoorForbidDisp hide={this.hide} {...props} />}
              />
              <Route
                path="/device"
                render={props => <DeviceDisp hide={this.hide} {...props} />}
              />
              <Route
                path="/order"
                render={props => <OrderDisp hide={this.hide} {...props} />}
              />
              <Route
                path="/fund"
                render={props => <FundDisp hide={this.hide} {...props} />}
              />
              <Route
                path="/gift"
                render={props => <GiftDisp hide={this.hide} {...props} />}
              />
              <Route
                path="/lost"
                render={props => <LostDisp hide={this.hide} {...props} />}
              />
              <Route
                path="/employee"
                render={props => <EmployeeDisp hide={this.hide} {...props} />}
              />
              <Route
                path="/task"
                render={props => <TaskDisp hide={this.hide} {...props} />}
              />
              <Route
                path="/stat"
                render={props => <StatDisp hide={this.hide} {...props} />}
              />
              <Route
                path="/user"
                render={props => <UserDisp hide={this.hide} {...props} />}
              />
              <Route
                path="/notify"
                render={props => <NotifyDisp hide={this.hide} {...props} />}
              />
              <Route
                path="/version"
                render={props => <VersionDisp hide={this.hide} {...props} />}
              />
              <Route
                path="/account"
                render={props => (
                  <AccountInfo
                    hide={this.hide}
                    user={this.props.user}
                    logout={this.logout}
                    {...props}
                  />
                )}
              />
              <Route exact path="/" render={() => <Redirect to="/welcome" />} />
            </div>
          </Content>
        </Layout>
      </div>
    )
  }
}
const mapStateToProps = (state, ownProps) => {
  return {
    schools: state.setSchoolList.schools,
    recent: state.setSchoolList.recent,
    schoolSet: state.setSchoolList.schoolSet,
    forbiddenUrls: state.setAuthenData.forbiddenUrls,
    authenSet: state.setAuthenData.authenSet,
    user: state.setUserInfo
  }
}
export default withRouter(
  connect(mapStateToProps, {
    changeSchool,
    changeDevice,
    changeOrder,
    changeFund,
    changeGift,
    changeLost,
    changeUser,
    changeTask,
    changeEmployee,
    changeNotify,
    changeVersion,
    setSchoolList,
    changeStat,
    setAuthenData,
    fetchPrivileges,
    setUserInfo,
    changeOnline,
    changeOffline
  })(Main)
)
