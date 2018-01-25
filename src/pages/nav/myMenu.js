import React from 'react'
import { Link } from 'react-router-dom'
import { Icon } from 'antd'
import './style/index.css'
import CONSTANTS from '../../constants'
import { setLocal, getLocal } from '../../util/storage'
import Time from '../../util/time'

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
  setAuthenData
} from '../../actions'
import { withRouter } from 'react-router-dom'
import { checkObject } from '../../util/checkSame'

// const this.rootBlock = CONSTANTS.this.rootBlock

class MyMenu extends React.Component {
  static propTypes = {
    schools: PropTypes.array.isRequired,
    schoolSet: PropTypes.bool.isRequired,
    recent: PropTypes.array.isRequired,
    full: PropTypes.array.isRequired,
    current: PropTypes.array.isRequired,
    authenSet: PropTypes.bool.isRequired
  }
  constructor(props) {
    super(props)
    // let forbidden = getStore('forbidden')
    this.state = {
      current: '',
      openKeys: [],
      pathname: '',
      currentRoot: '',
      currentChild: ''
    }
    this.rootBlock = []
  }
  componentDidMount() {
    let pathname = window.location.pathname
    this.changeMenu(pathname)
    this.setState({
      pathname: pathname
    })
    if (this.props.authenSet) {
      this.setNavs()
    }
  }
  setNavs = () => {
    let { current } = this.props
    // get the main nav, COUSTANTS.rootBlock is the full nav
    let originalNavs = JSON.parse(JSON.stringify(CONSTANTS.rootBlock))
    let rootBlock = originalNavs.filter(r => {
      let found = current && current.find(rec => rec.name === r.name)
      if (found) {
        return true
      } else {
        return false
      }
    })
    // get the sub nav
    rootBlock.forEach(r => {
      let subBlock = []
      let root = current && current.find(rec => rec.name === r.name)
      // should always exist
      // console.log(r)
      if (root && root.children && r.children) {
        subBlock = r.children.filter(sub => {
          let found = root.children.find(rs => rs.name === sub.name)
          if (found) {
            return true
          } else {
            return false
          }
        })
        // console.log(subBlock)
        r.children = subBlock
      }
    })
    /*
    if (rootBlock.length === 0) {
      this.rootBlock = originalNavs
    } else {
      this.rootBlock = rootBlock
    }
    */
    this.rootBlock = rootBlock
    /*
    if (rootBlock.length > 0) {
      this.rootBlock = rootBlock
    } else {
      this.rootBlock = CONSTANTS.rootBlock
    }
    */
    this.changeMenu()
  }
  componentDidUpdate() {
    let pathname = window.location.pathname
    if (pathname !== this.state.pathname) {
      this.changeMenu()
    }
  }
  componentWillReceiveProps(nextProps) {
    if (checkObject(this.props, nextProps, ['authenSet'])) {
      return
    }
    let { authenSet } = nextProps
    if (authenSet) {
      this.props = nextProps
      this.setNavs()
    }
  }
  changeMenu = pathname => {
    // 只有在不是由导航栏点击改变url时，才会触发changemenu，因此只要打开就可以了，不用管关闭组标签
    let path = pathname || window.location.pathname,
      nextState = {}
    let parentPath = path.split('/')[1] || ''
    for (let i = 0; i < this.rootBlock.length; i++) {
      if (parentPath === this.rootBlock[i].path) {
        nextState.currentRoot = this.rootBlock[i].key

        let children = this.rootBlock[i].children,
          currentChild = 0

        if (children) {
          for (let j = 0; j < children.length; j++) {
            if (path.includes(children[j].path)) {
              currentChild = children[j].key
              break
            }
          }
        }

        nextState.currentChild = currentChild
        nextState.pathname = path
        this.setState(nextState)

        this.props.changeWidth(!!this.rootBlock[i].children)
        return
      }
    }
    // no one matchs
    this.setState({
      currentRoot: '',
      currentChild: '',
      pathname: path
    })
  }

  getDefaultSchool = () => {
    let { recent, schools } = this.props
    /* if (!schoolSet) {
      return this.setDefaultSchool()
    } */
    var selectedSchool = 'all',
      defaultSchool = getLocal('defaultSchool')
    if (recent.length > 0) {
      selectedSchool = recent[0].id.toString()
    } else if (defaultSchool) {
      selectedSchool = defaultSchool
    } else {
      setLocal('defaultSchool', schools[0].id.toString())
      selectedSchool = schools[0].id.toString()
    }
    if (selectedSchool !== 'all') {
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
      this.props.changeLost('lostList', { schoolId: selectedSchool })
      this.props.changeUser('userList', { schoolId: selectedSchool })
      // this.props.changeTask('taskList', {schoolId: selectedSchool})
      this.props.changeEmployee('employeeList', { schoolId: selectedSchool })
      this.props.changeStat('overview', { schoolId: selectedSchool })
      this.props.changeStat('charts', { schoolId: selectedSchool })
      this.props.changeStat('rank', { schoolId: selectedSchool })
    }
  }

  setStatusForschool = () => {
    this.clearStatus4schoolIIlist()
  }
  clearStatus4schoolIIlist = () => {
    this.getDefaultSchool()
    this.props.changeSchool('schoolList', { page: 1 })
  }
  clearStatus4schoolIIoverview = () => {
    this.getDefaultSchool()
    this.props.changeSchool('overview', { page: 1 })
  }

  setStatusFordevice = () => {
    this.clearStatus4deviceIIlist()
  }
  clearStatus4deviceIIlist = () => {
    this.getDefaultSchool()
    this.props.changeDevice('deviceList', {
      page: 1,
      deviceType: 'all',
      selectKey: ''
    })
  }
  clearStatus4deviceIIcomponents = () => {
    this.props.changeDevice('components', { page: 1 })
  }
  clearStatus4deviceIIprepay = () => {
    this.getDefaultSchool()
    this.props.changeDevice('prepay', { page: 1 })
  }
  clearStatus4deviceIItimeset = () => {
    this.getDefaultSchool()
    this.props.changeDevice('timeset', { page: 1 })
  }
  clearStatus4deviceIIsuppliers = () => {
    this.props.changeDevice('suppliers', { page: 1 })
  }
  clearStatus4deviceIIrateSet = () => {
    this.getDefaultSchool()
    this.props.changeDevice('rateSet', { page: 1 })
  }
  clearStatus4deviceIIrepair = () => {
    this.getDefaultSchool()
    this.props.changeDevice('repair', {
      page: 1,
      deviceType: 'all',
      status: 'all'
    })
  }
  clearStatus4deviceIIrateLimit = () => {
    this.getDefaultSchool()
    this.props.changeDevice('rateLimit', { page: 1 })
  }

  setStatusFororder = () => {
    this.clearStatus4orderIIlist()
  }
  clearStatus4orderIIlist = () => {
    this.getDefaultSchool()
    this.props.changeOrder('orderList', {
      page: 1,
      deviceType: 'all',
      status: 'all',
      selectKey: '',
      startTime: Time.get7DaysAgoStart(),
      endTime: Time.getTodayEnd(),
      userType: 'all'
    })
  }
  clearStatus4orderIIabnormal = () => {
    this.getDefaultSchool()
    this.props.changeOrder('abnormal', {
      page: 1,
      deviceType: 'all',
      selectKey: '',
      startTime: Time.get7DaysAgoStart(),
      endTime: Time.getTodayEnd(),
      userType: 'all'
    })
  }

  setStatusForfund = () => {
    this.clearStatus4fundIIlist()
  }
  clearStatus4fundIIlist = () => {
    this.getDefaultSchool()
    this.props.changeFund('fundList', {
      page: 1,
      type: 'all',
      status: 'all',
      selectKey: '',
      startTime: Time.get7DaysAgoStart(),
      endTime: Time.getTodayEnd(),
      userType: 'all'
    })
  }
  clearStatus4fundIIcashtime = () => {
    this.getDefaultSchool()
    this.props.changeFund('cashtime', { page: 1 })
  }
  clearStatus4fundIIcharge = () => {
    this.getDefaultSchool()
    this.props.changeFund('charge', { page: 1 })
  }
  clearStatus4fundIIdeposit = () => {
    this.getDefaultSchool()
    this.props.changeFund('deposit', { page: 1 })
  }
  clearStatus4fundIIabnormal = () => {
    this.getDefaultSchool()
    this.props.changeFund('abnormal', {
      page: 1,
      selectKey: '',
      userType: 'all'
    })
  }

  setStatusForgift = () => {
    this.clearStatus4giftIIlist()
  }
  clearStatus4giftIIlist = () => {
    this.props.changeGift('giftList', { page: 1, deviceType: 'all' })
  }
  clearStatus4giftIIact = () => {
    this.getDefaultSchool()
    this.props.changeGift('act', { page: 1 })
  }

  setStatusForlost = () => {
    this.getDefaultSchool()
    this.props.changeLost('lostList', { page: 1, type: 'all' })
  }

  setStatusForuser = () => {
    this.getDefaultSchool()
    this.props.changeUser('userList', { page: 1, selectKey: '' })
  }

  setStatusFortask = () => {
    /* 工单列表的状态不需要在离开后改变 */
    // this.clearStatus4taskIIlist()
  }
  clearStatus4taskIIlist = () => {
    /* 工单列表的状态不需要在离开后改变 */
    /* const taskList = 'taskList'
    this.getDefaultSchool()
    this.props.changeTask(taskList, {page: 1, assigned: false, sourceType: 'all', pending: 'all', all: '1'})
    */
  }
  clearStatus4taskIIlog = () => {
    // this.getDefaultSchool()
    this.props.changeTask('log', { page: 1, all: '1', schoolId: 'all' })
  }
  clearStatus4taskIIabnormal = () => {
    this.getDefaultSchool()
    this.props.changeTask('abnormal', { page: 1, selectKey: '' })
  }
  clearStatus4taskIIcomplaint = () => {
    // this.getDefaultSchool()
    this.props.changeTask('complaint', {
      page: 1,
      type: 'all',
      status: 'all',
      selectKey: '',
      schoolId: 'all'
    })
  }
  clearStatus4taskIIfeedback = () => {
    // this.getDefaultSchool()
    this.props.changeTask('feedback', { page: 1, schoolId: 'all' })
  }

  setStatusForstat = () => {
    this.getDefaultSchool()
  }

  setStatusForemployee = () => {
    this.clearStatus4employeeIIlist()
    // this.props.changeEmployee('employeeList', {page: 1, selectKey: ''})
  }
  clearStatus4employeeIIlist = () => {
    this.getDefaultSchool()
    this.props.changeEmployee('employeeList', { page: 1, selectKey: '' })
  }
  clearStatus4employeeIIrole = () => {
    this.getDefaultSchool()
    this.props.changeEmployee('roleList', { page: 1 })
  }

  setStatusFornotify = () => {
    this.props.changeNotify('notify', { page: 1, type: 'all' })
  }

  setStatusForversion = () => {
    this.props.changeVersion('version', { page: 1 })
  }

  chooseRoot = key => {
    let { currentRoot } = this.state
    let nextState = {}
    nextState.currentRoot = key
    let currentModule = this.rootBlock.find(
      module => module.key === currentRoot
    )
    let nextModule = this.rootBlock.find(module => module.key === key)

    let setStatusCbName = `setStatusFor${nextModule.path}`
    let cb = this[setStatusCbName]
    if (cb) {
      cb()
    }
    if (nextModule.children) {
      nextState.currentChild = nextModule.children[0].key
    }
    let currentHaveChild = !!(currentModule && currentModule.children)
    let nextHaveChild = !!nextModule.children
    this.setState(nextState)
    if (currentHaveChild !== nextHaveChild) {
      this.props.changeWidth(nextHaveChild)
    }
  }
  changeChild = (e, key) => {
    let { currentRoot } = this.state
    let parent = this.rootBlock.find(module => module.key === currentRoot)
    let child = parent.children.find(son => son.key === key)
    let cb = this[`clearStatus4${parent.path}II${child.path}`]
    if (cb) {
      cb()
    }
    this.setState({
      currentChild: key
    })
  }
  render() {
    const { currentRoot, currentChild } = this.state
    const rootItems =
      this.rootBlock &&
      this.rootBlock.map((r, i) => {
        const route = r.children
          ? `/${r.path}/${r.children[0].path}`
          : `/${r.path}`
        return (
          <li
            key={i}
            className={currentRoot === r.key ? 'activeRootItem' : ''}
            onClick={() => {
              this.chooseRoot(r.key)
            }}
          >
            <Link to={route}>
              <Icon type={r.icon} />
              <span className="itemName">{r.name}</span>
            </Link>
          </li>
        )
      })
    const currentRoute = this.rootBlock.find(r => r.key === currentRoot)
    // console.log(currentRoute);
    const secondItems =
      currentRoute &&
      currentRoute.children &&
      currentRoute.children.map((r, i) => {
        return (
          <li
            key={i}
            className={currentChild === r.key ? 'activeSecondItem' : ''}
            onClick={e => {
              this.changeChild(e, r.key)
            }}
          >
            <Link to={`/${currentRoute.path}/${r.path}`}>{r.name}</Link>
          </li>
        )
      })
    const secondNav = (
      <div className="secondNav">
        <ul>
          <li className="secondTitle">{currentRoute && currentRoute.name}</li>
          {secondItems}
        </ul>
      </div>
    )
    return (
      <div className="navWrapper">
        <div className="rootNav">
          <ul>{rootItems}</ul>
        </div>

        {currentRoute && currentRoute.children ? secondNav : null}
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    schools: state.setSchoolList.schools,
    schoolSet: state.setSchoolList.schoolSet,
    recent: state.setSchoolList.recent,
    full: state.setAuthenData.full,
    current: state.setAuthenData.current,
    authenSet: state.setAuthenData.authenSet
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
    changeStat,
    setAuthenData
  })(MyMenu)
)
