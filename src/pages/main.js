import React from 'react'
import {Route, Redirect, Link} from 'react-router-dom'
import { asyncComponent } from './component/asyncComponent'
import Layout from 'antd/lib/layout'
import MyMenu from './nav/myMenu'
import userImg from './assets/user.png'
import logo from './assets/logo.png'
import {getLocal, setLocal} from './util/storage'
import AjaxHandler from './ajax'


import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeSchool, changeDevice, changeOrder, changeFund, changeGift, changeLost, changeUser, changeTask, changeEmployee, changeNotify, changeVersion } from '../actions'


const Welcome = asyncComponent(() => import(/* webpackChunkName: "welcome" */ "./welcome/welcome"))
const SchoolDisp = asyncComponent(() => import(/* webpackChunkName: "school" */ "./school/schoolDisp"))
const DeviceDisp = asyncComponent(() => import(/* webpackChunkName: "device" */ "./device/deviceDisp"))
const OrderDisp = asyncComponent(() => import(/* webpackChunkName: "order" */ "./order/orderDisp"))
const FundDisp = asyncComponent(() => import(/* webpackChunkName: "fund" */ "./fund/fundDisp"))
const GiftDisp = asyncComponent(() => import(/* webpackChunkName: "gift" */ "./gift/giftDisp"))
const LostDisp = asyncComponent(() => import(/* webpackChunkName: "lost" */ "./lost/lostDisp"))
const EmployeeDisp = asyncComponent(() => import(/* webpackChunkName: "employee" */ "./employee/employeeDisp"))
const TaskDisp = asyncComponent(() => import(/* webpackChunkName: "task" */ "./task/taskDisp"))
const StatDisp = asyncComponent(() => import(/* webpackChunkName: "stat" */ "./stat/statDisp"))
const UserDisp = asyncComponent(() => import(/* webpackChunkName: "user" */ "./user/userDisp"))
const NotifyDisp = asyncComponent(() => import(/* webpackChunkName: "notify" */ "./notify/notifyDisp"))
const AccountInfo = asyncComponent(() => import(/* webpackChunkName: "account" */ "./account/accountInfo"))
const VersionDisp = asyncComponent(() => import(/* webpackChunkName: "version" */ "./version/versionDisp"))

const { Content, Sider } = Layout;

class Main extends React.Component {
  state = {
    hasChildren: true
  }
  componentDidMount () {
    this.getDefaultSchool()
    this.props.hide(false)
  }
  componentWillUnmount () {
    this.props.hide(true)
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
  logout = () => {
    this.props.logout()
  }
  hide = (v) => { // hide means if to hide the main content or not
    let loading = this.refs.loading
    if (v) { // loading , need to show the loading div
      loading&&loading.classList.remove('hide')
    } else { // add 'hide' to not display loading
      loading&&loading.classList.add('hide')
    }
  }
  changeWidth = (hasChildren) => {
    this.setState({
      hasChildren: hasChildren
    })
  }
  changeCurrentName = (nickName) => {
    this.props.changeCurrentName(nickName)
  }
  render () {
    return (
        <div className='container'>

          <div
            className='nav'
          >
            <div className='sideWrapper'>
               <Link to='/welcome' >
               <div className="logo" onClick={this.welcome}>
               <img src={logo} alt='' />
              </div></Link>

              <MyMenu changeWidth={this.changeWidth} />
            </div>
          </div>

          <Layout
          >
            <Content className='content'>
              <Link id='loggedInfo' to='/account'>
                <span>{this.props.user.name}</span>
                <img src={userImg} alt='' />
              </Link>
              <div className='loading' ref='loading'>加载中...</div>
              <div className='main'>
                <Route path='/welcome' render={(props)=>(<Welcome hide={this.hide} {...props} />)} />
                <Route path='/school' render={(props)=>(<SchoolDisp hide={this.hide} {...props} />)} />
                <Route path='/device' render={(props)=>(<DeviceDisp hide={this.hide} {...props} />)} />
                <Route path='/order' render={(props)=>(<OrderDisp hide={this.hide} {...props} />)} />
                <Route path='/fund' render={(props)=>(<FundDisp hide={this.hide} {...props} />)} />
                <Route path='/gift' render={(props)=>(<GiftDisp hide={this.hide} {...props} />)} />
                <Route path='/lost' render={(props)=>(<LostDisp hide={this.hide} {...props} />)} />
                <Route path='/employee' render={(props)=>(<EmployeeDisp hide={this.hide} changeCurrentName={this.changeCurrentName} {...props} />)} />
                <Route path='/task' render={(props)=>(<TaskDisp hide={this.hide} {...props} />)} />
                <Route path='/stat' render={(props)=>(<StatDisp hide={this.hide} {...props} />)} />
                <Route path='/user' render={(props)=>(<UserDisp hide={this.hide} {...props} />)} />
                <Route path='/notify' render={(props)=>(<NotifyDisp hide={this.hide} {...props} />)} />
                <Route path='/version' render={(props)=>(<VersionDisp hide={this.hide} {...props} />)} />
                <Route path='/account' render={(props)=>(<AccountInfo hide={this.hide} user={this.props.user} logout={this.logout} {...props} />)} />
                <Route exact path='/' render={()=>(<Redirect hide={this.hide} to='/welcome' />)} />
              </div>
            </Content>
          </Layout>
        </div>
    );
  }
}

export default withRouter(connect(null, {
  changeSchool, changeDevice, changeOrder, changeFund, changeGift, changeLost, changeUser, changeTask, changeEmployee, changeNotify, changeVersion
})(Main))