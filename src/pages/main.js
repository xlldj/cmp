import React from 'react'
import {Route, Redirect, Link} from 'react-router-dom'
import { asyncComponent } from './component/asyncComponent'
import Layout from 'antd/lib/layout'
import MyMenu from './nav/myMenu'
import userImg from './assets/user.png'
import logo from './assets/logo.png'
import {getLocal, setLocal, removeLocal} from './util/storage'
import AjaxHandler from './ajax'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeSchool, changeDevice, changeOrder, changeFund, changeGift, changeLost, changeUser, changeTask, changeEmployee, changeNotify, changeVersion, changeStat, setSchoolList } from '../actions'


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

const { Content} = Layout;

class Main extends React.Component {
  static propTypes = {
    schools: PropTypes.array.isRequired,
    recent: PropTypes.array.isRequired,
    schoolSet: PropTypes.bool.isRequired
  }

  state = {
    hasChildren: true,
    ti: null
  }
  componentDidMount () {
    this.props.setSchoolList({
      schoolSet: false,
      schools: [],
      recent: []
    })
    this.fetchSchools()
    this.props.hide(false)
  }
  componentWillUnmount () {
    this.props.hide(true)
    console.log('unmount')
    console.log(this.state.ti)
    if (this.state.ti) {
      clearTimeout(this.state.ti)
    }
  }

  fetchSchools = () => {
    let resource='/school/list'
    const body={
      page: 1,
      size: 100
    }
    const cb = (json) => {
      if(json.error){
        throw new Error(json.error.displayMessage || json.error)
      }else{
        if(json.data){
          let recentSchools = getLocal('recentSchools'), recent = []
          if (recentSchools) {
            let localRecentArray = recentSchools.split(',')
            recent = json.data.schools.filter((r) => {
              return localRecentArray.some((s) => (r.id === parseInt(s, 10)))
            })
            let recentIds = recent && recent.map((r) => (r.id))
            setLocal('recentSchools', recentIds.join(','))
          } 
          if (recent.length === 0) {
            removeLocal('recentSchools')
            let selectedSchool = json.data.schools[0].id.toString()
            this.props.changeSchool('schoolList', {schoolId: selectedSchool})
            this.props.changeSchool('overview', {schoolId: selectedSchool})
            this.props.changeDevice('deviceList', {schoolId: selectedSchool})
            this.props.changeDevice('repair', {schoolId: selectedSchool})
            this.props.changeOrder('orderList', {schoolId: selectedSchool})
            this.props.changeOrder('abnormal', {schoolId: selectedSchool})
            this.props.changeFund('fundList', {schoolId: selectedSchool})
            this.props.changeFund('deposit', {schoolId: selectedSchool})
            this.props.changeFund('abnormal', {schoolId: selectedSchool})
            this.props.changeGift('act', {schoolId: selectedSchool})
            this.props.changeLost('lostList', {schoolId: selectedSchool})
            this.props.changeUser('userList', {schoolId: selectedSchool}) 
            this.props.changeTask('taskList', {schoolId: selectedSchool}) 
            this.props.changeTask('log', {schoolId: selectedSchool})
            this.props.changeTask('complaint', {schoolId: selectedSchool})
            this.props.changeTask('feedback', {schoolId: selectedSchool})
            this.props.changeStat('overview', {schoolId: selectedSchool})
            this.props.changeStat('charts', {schoolId: selectedSchool})
            this.props.changeStat('rank', {schoolId: selectedSchool})
          }
          this.props.setSchoolList({schoolSet: true, recent: recent, schools: json.data.schools})
        }else{
          throw new Error('网络出错，请稍后重试～')
        }        
      }
    }
    AjaxHandler.ajax(resource,body,cb)
  }

  logout = () => {
    this.props.logout()
  }
  hide = (v) => { // hide means if to hide the main content or not
    let loading = this.refs.contentLoading
    if (v) { // loading , need to show the loading div
      loading&&loading.classList.remove('hide')
      let nextState = {}
      // if wait for more than 5s, refresh the web
      nextState.ti = setTimeout(this.refresh, 5000)
      this.setState(nextState)
    } else { // add 'hide' to not display loading
      loading&&loading.classList.add('hide')
      let {ti} = this.state
      if (ti) {
        clearTimeout(ti)
        this.setState({
          ti: null
        })
      }
    }
  }
  refresh = () => {
    let {pathname} = this.props.history.location
    window.location.assign(pathname)
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
              <div className='loading' ref='contentLoading'>加载中...</div>
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
                <Route exact path='/' render={()=>(<Redirect  to='/welcome' />)} />
              </div>
            </Content>
          </Layout>
        </div>
    );
  }
}
const mapStateToProps = (state, ownProps) => {
  return {
    schools: state.setSchoolList.schools,
    recent: state.setSchoolList.recent,
    schoolSet: state.setSchoolList.schoolSet
  }
}
export default withRouter(connect(mapStateToProps, {
  changeSchool, changeDevice, changeOrder, changeFund, changeGift, changeLost, changeUser, changeTask, changeEmployee, changeNotify, changeVersion,
  setSchoolList,
  changeStat
})(Main))