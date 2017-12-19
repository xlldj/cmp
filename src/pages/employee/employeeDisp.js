import React from 'react'
import { Route, Redirect} from 'react-router-dom'
import Bread from '../bread'
import './style/style.css'

import {asyncComponent} from '../component/asyncComponent'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeEmployee } from '../../actions'

const EmployeeContainer = asyncComponent(()=>import(/* webpackChunkName: "employeeContainer" */ "./employeeContainer"))
const AuthenContainer = asyncComponent(()=>import(/* webpackChunkName: "authenContainer" */ "./authen/authenContainer"))
const RoleContainer = asyncComponent(()=>import(/* webpackChunkName: "roleContainer" */ "./role/roleContainer"))

const breadcrumbNameMap = {
  '/list': '员工列表',
  '/list/add': '添加员工',
  '/list/detail': '详情',
  '/authen': '权限设置',
  '/authen/list': '权限列表',
  '/authen/detail': '详情',
  '/role': '身份设置',
  '/role/list': '身份列表',
  '/role/detail': '详情'
}

class EmployeeDisp extends React.Component {
  setStatusForemployee = () => {
    this.props.changeEmployee('employeeList', {page: 1, selectKey: ''})
  }
  changeCurrentName = (nickName) => {
    this.props.changeCurrentName(nickName)
  }
  render () {
    return (
      <div>
        <div className='breadc'>
          <Bread 
            breadcrumbNameMap={breadcrumbNameMap} 
            parent='employee' 
            setStatusForemployee={this.setStatusForemployee}  
            parentName='员工管理' 
          />
        </div>

        <div className='disp'>
          <Route path='/employee/list' render={(props) => (<EmployeeContainer hide={this.props.hide} changeCurrentName={this.changeCurrentName} {...props} />)} />
          <Route path='/employee/authen' render={(props) => (<AuthenContainer hide={this.props.hide} {...props} />)} />
          <Route path='/employee/role' render={(props) => (<RoleContainer hide={this.props.hide} {...props} />)} />
          <Route exact path='/employee' render={(props) => (<Redirect to='/employee/list' />)} />
        </div>
      </div>
    )
  }
}


export default withRouter(connect(null, {
  changeEmployee
})(EmployeeDisp))
