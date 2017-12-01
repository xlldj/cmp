import React from 'react'
import { Route} from 'react-router-dom'
import Bread from '../bread'
import './style/style.css'

import {asyncComponent} from '../component/asyncComponent'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeEmployee } from '../../actions'

const EmployeeList = asyncComponent(()=>import(/* webpackChunkName: "employeeList" */ "./employeeList"))
const EmployeeInfo = asyncComponent(()=>import(/* webpackChunkName: "employeeInfo" */ "./employeeInfo"))

const breadcrumbNameMap = {
  '/userInfo': '编辑员工',
  '/addUser': '添加员工'
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
          <Bread breadcrumbNameMap={breadcrumbNameMap} single={true} parent='employee' setStatusForemployee={this.setStatusForemployee}  parentName='员工管理' />
        </div>

        <div className='disp'>
          <Route path='/employee/userInfo/:id' render={(props) => (<EmployeeInfo hide={this.props.hide} changeCurrentName={this.changeCurrentName} {...props} />)} />
          <Route path='/employee/addUser' render={(props) => (<EmployeeInfo hide={this.props.hide} {...props} />)} />
          <Route exact path='/employee' render={(props) => (<EmployeeList hide={this.props.hide} {...props} />)} />
        </div>
      </div>
    )
  }
}


export default withRouter(connect(null, {
  changeEmployee
})(EmployeeDisp))
