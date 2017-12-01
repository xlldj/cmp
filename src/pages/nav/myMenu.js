import React from 'react'
import {Link} from 'react-router-dom'
import {Menu, Icon} from 'antd'
import './style/index.css'
import CONSTANTS from '../component/constants'
import {getLocal, setLocal} from '../util/storage'
import AjaxHandler from '../ajax'


import { connect } from 'react-redux'
import { changeSchool, changeDevice, changeOrder, changeFund, changeGift, changeLost, changeUser, changeTask, changeEmployee, changeNotify, changeVersion } from '../../actions'
import { withRouter } from 'react-router-dom'


const SubMenu = Menu.SubMenu

const rootBlock = CONSTANTS.rootBlock

class MyMenu extends React.Component {
  state = {
    current: '',
    openKeys: [],
    pathname: '',
    currentRoot: '',
    currentChild: ''
  }
  componentDidMount () {
    let pathname = window.location.pathname
    this.changeMenu(pathname)
    this.setState({
      pathname: pathname
    })
  }
  componentDidUpdate () {
    let pathname = window.location.pathname
    if (pathname !== this.state.pathname) {
      this.changeMenu()
    }
  }
  changeMenu = (pathname) => { // 只有在不是由导航栏点击改变url时，才会触发changemenu，因此只要打开就可以了，不用管关闭组标签
    let path = pathname || window.location.pathname, nextState = {}
    let parentPath = path.split('/')[1] || '', onlyParent = path.split('/').length < 3
    // console.log(path.split('/'))
    for (let i=0;i<rootBlock.length;i++) {
      if (parentPath === rootBlock[i].path) {

        nextState.currentRoot = rootBlock[i].key

        let children = rootBlock[i].children, currentChild = 0

        if (children) {
          for (let j=0;j<children.length;j++) {
            if (path.includes(children[j].path)) {
              currentChild = children[j].key
              break
            }
          }
        }

        nextState.currentChild = currentChild
        nextState.pathname = path
        this.setState(nextState)

        this.props.changeWidth(!!rootBlock[i].children)
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
    const recentSchools = getLocal('recentSchools')
    var selectedSchool = 'all'
    if (recentSchools) {
      let recent = recentSchools.split(',')
      let schoolId = recent[0]
      selectedSchool = schoolId
    } else if (getLocal('defaultSchool')) {
      let defaultSchool = getLocal('defaultSchool')
      selectedSchool = defaultSchool
    } else {
      this.setDefaultSchool()
    }
    if (selectedSchool !== 'all') {
      this.props.changeOrder('order', {schoolId: selectedSchool})
      this.props.changeDevice('deviceList', {schoolId: selectedSchool})
      this.props.changeDevice('repair', {schoolId: selectedSchool})
      this.props.changeFund('fundList', {schoolId: selectedSchool})
      this.props.changeLost('lostList', {schoolId: selectedSchool})
      this.props.changeUser('userList', {schoolId: selectedSchool})
    }
  }
  setDefaultSchool = () => {
    let resource = '/school/list'
    const body = {
      page: 1,
      size: 1
    }
    const cb = (json) => {
      if (json.data.schools) {
        let selectedSchool = json.data.schools[0].id.toString()
        setLocal('defaultSchool', selectedSchool)
        this.props.changeOrder('order', {schoolId: selectedSchool})
        this.props.changeDevice('deviceList', {schoolId: selectedSchool})
        this.props.changeDevice('repair', {schoolId: selectedSchool})
        this.props.changeFund('fundList', {schoolId: selectedSchool})
        this.props.changeLost('lostList', {schoolId: selectedSchool})
        this.props.changeUser('userList', {schoolId: selectedSchool}) 
      } 
    }
    AjaxHandler.ajax(resource, body, cb)
  }

  setStatusForschool = () => {
    this.clearStatus4schoolIIlist()
  }
  clearStatus4schoolIIlist = () => {
    this.props.changeSchool('schoolList', {page: 1, schoolId: 'all'})
  }

  setStatusFordevice = () => {
    this.clearStatus4deviceIIlist()
  }
  clearStatus4deviceIIlist = () => {
    this.getDefaultSchool()
    this.props.changeDevice('deviceList', {page: 1, deviceType: 'all', selectKey: ''})
  }
  clearStatus4deviceIIcomponents = () => {
    this.props.changeDevice('components', {page: 1})
  }
  clearStatus4deviceIIprepay = () => {
    this.props.changeDevice('prepay', {page: 1})
  }
  clearStatus4deviceIItimeset = () => {
    this.props.changeDevice('timeset', {page: 1})
  }
  clearStatus4deviceIIsuppliers = () => {
    this.props.changeDevice('suppliers', {page: 1})
  }
  clearStatus4deviceIIrateSet = () => {
    this.props.changeDevice('rateSet', {page: 1})
  }
  clearStatus4deviceIIrepair = () => {
    this.getDefaultSchool()
    this.props.changeDevice('repair', {page: 1, deviceType: 'all', status: 'all'})
  }


  setStatusFororder = () => {
    this.getDefaultSchool()
    this.props.changeOrder('order', {page: 1, deviceType: 'all', status: 'all', selectKey: ''})
  }


  setStatusForfund = () => {
    this.clearStatus4fundIIlist()
  }
  clearStatus4fundIIlist = () => {
    this.getDefaultSchool()
    this.props.changeFund('fundList', {page: 1, type: 'all', status: 'all', selectKey: ''})
  }
  clearStatus4fundIIcashtime = () => {
    this.props.changeFund('cashtime', {page: 1})
  }
  clearStatus4fundIIcharge = () => {
    this.props.changeFund('charge', {page: 1})
  }
  clearStatus4fundIIdeposit = () => {
    this.props.changeFund('deposit', {page: 1, schoolId: 'all'})
  }


  setStatusForgift = () => {
    this.clearStatus4giftIIlist()
  }
  clearStatus4giftIIlist = () => {
    this.props.changeGift('giftList', {page: 1, deviceType: 'all'})
  }
  clearStatus4giftIIact = () => {
    this.props.changeGift('act', {page: 1, schoolId: 'all'})
  }


  setStatusForlost = () => {
    this.getDefaultSchool()
    this.props.changeLost('lostList', {page: 1, type: 'all'})
  }


  setStatusForuser = () => {
    this.getDefaultSchool()
    this.props.changeUser('userList', {page: 1, selectKey: ''})
  }


  setStatusFortask = () => {
    this.clearStatus4taskIIlist()
  }
  clearStatus4taskIIlist = () => {
    const taskList = 'taskList'
    this.props.changeTask(taskList, {page: 1, assigned: false, sourceType: 'all', pending: 'all', all: '1'})
  }
  clearStatus4taskIIlog = () => {
    this.props.changeTask('log', {page: 1, all: '1'})
  }
  clearStatus4taskIIabnormal = () => {
    this.props.changeTask('abnormal', {page: 1, selectKey: ''})
  }
  clearStatus4taskIIcomplaint = () => {
    this.props.changeTask('complaint', {page: 1, type: 'all', status: 'all', selectKey: ''})
  }
  clearStatus4taskIIfeedback = () => {
    this.props.changeTask('feedback', {page: 1})
  }



  setStatusForemployee = () => {
    this.props.changeEmployee('employeeList', {page: 1, selectKey: ''})
  }


  setStatusFornotify = () => {
    this.props.changeNotify('notify', {page: 1, type: 'all'})
  }
  

  setStatusForversion = () => {
    this.props.changeVersion('version', {page: 1})
  }

  chooseRoot = (key) => {
    let {currentRoot} = this.state
    let nextState = {}
    nextState.currentRoot = key
    let currentModule = rootBlock.find((module) => (module.key === currentRoot))
    let nextModule = rootBlock.find((module) => (module.key === key))

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
    let {currentRoot, currentChild} = this.state
    let parent = rootBlock.find((module) => (module.key === currentRoot))
    let child = parent.children.find((son) => (son.key === key))
    let cb = this[`clearStatus4${parent.path}II${child.path}`]
    if (cb) {
      cb()
    }
    this.setState({
      currentChild: key
    })
  }
  render () {
    const {currentRoot, currentChild} = this.state
    const rootItems = rootBlock.map((r, i) => {
      const route = r.children ? `/${r.path}/${r.children[0].path}` : `/${r.path}`
      return (
        <li key={i} className={currentRoot === r.key ? 'activeRootItem' : ''} onClick={() => {this.chooseRoot(r.key)}}>
          <Link to={route}>
              <Icon type={r.icon} />
              <span className='itemName'>{r.name}</span>
          </Link>
        </li>
      )
    })
    const currentRoute = rootBlock.find((r) => (r.key === currentRoot))
    const secondItems = currentRoute&&currentRoute.children&&currentRoute.children.map((r, i) => {
      return (
        <li key={i} className={currentChild === r.key ? 'activeSecondItem' : ''}  onClick={(e) => {this.changeChild(e, r.key)}}>
          <Link to={`/${currentRoute.path}/${r.path}`}>
            {r.name}
          </Link>
        </li>
      )
    })
    const secondNav = (
      <div className='secondNav'>
        <ul>
          <li className='secondTitle'>
            {currentRoute && currentRoute.name}
          </li>
          {secondItems}
        </ul>
      </div>
    )
    return (
      <div className='navWrapper'>
        <div className='rootNav'>
          <ul >
            {rootItems}
          </ul>
        </div>

        {currentRoute && currentRoute.children ? secondNav : null}
      </div>
    )
  }
}

// export default MyMenu
const mapStateToProps = (state, ownProps) => ({
})
export default withRouter(connect(null, {
  changeSchool, changeDevice, changeOrder, changeFund, changeGift, changeLost, changeUser, changeTask, changeEmployee, changeNotify, changeVersion
})(MyMenu))