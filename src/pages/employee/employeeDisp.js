import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import Bread from '../component/bread'
import './style/style.css'

import { asyncComponent } from '../component/asyncComponent'
import { getLocal } from '../../util/storage'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeEmployee } from '../../actions'

const EmployeeContainer = asyncComponent(() =>
  import(/* webpackChunkName: "employeeContainer" */ './employeeList/employeeContainer')
)
const AuthenContainer = asyncComponent(() =>
  import(/* webpackChunkName: "authenContainer" */ './authen/authenContainer')
)
const RoleContainer = asyncComponent(() =>
  import(/* webpackChunkName: "roleContainer" */ './role/roleContainer')
)

const breadcrumbNameMap = {
  '/list': '员工列表',
  '/list/add': '添加员工',
  '/list/detail': '详情',
  '/authen': '权限设置',
  '/authen/add': '添加权限',
  '/authen/list': '权限列表',
  '/authen/detail': '详情',
  '/role': '身份设置',
  '/role/add': '添加身份',
  '/role/list': '身份列表',
  '/role/detail': '详情'
}

class EmployeeDisp extends React.Component {
  setStatusForemployee = () => {
    this.clearStatus4employeeIIlist()
  }
  clearStatus4employeeIIlist = () => {
    this.getDefaultSchool()
    this.props.changeEmployee('employeeList', { page: 1, selectKey: '' })
  }
  clearStatus4employeeIIrole = () => {
    this.getDefaultSchool()
    this.props.changeEmployee('roleList', { page: 1 })
  }
  getDefaultSchool = () => {
    const recentSchools = getLocal('recentSchools'),
      defaultSchool = getLocal('defaultSchool')
    var selectedSchool = 'all'
    if (recentSchools) {
      let recent = recentSchools.split(',')
      let schoolId = recent[0]
      selectedSchool = schoolId
    } else if (defaultSchool) {
      selectedSchool = defaultSchool
    }
    if (selectedSchool !== 'all') {
      this.props.changeEmployee('employeeList', { schoolId: selectedSchool })
    }
  }
  render() {
    const { forbiddenStatus } = this.props
    const { EMPLOYEE_LIST_GET, ROLE_LIST_GET, AUTH_LIST_GET } = forbiddenStatus
    return (
      <div>
        <div className="breadc">
          <Bread
            breadcrumbNameMap={breadcrumbNameMap}
            parent="employee"
            setStatusForemployee={this.setStatusForemployee}
            clearStatus4employeeIIlist={this.clearStatus4employeeIIlist}
            clearStatus4employeeIIrole={this.clearStatus4employeeIIrole}
            parentName="员工管理"
          />
        </div>

        <div className="disp">
          {EMPLOYEE_LIST_GET ? null : (
            <Route
              path="/employee/list"
              render={props => (
                <EmployeeContainer
                  forbiddenStatus={forbiddenStatus}
                  hide={this.props.hide}
                  {...props}
                />
              )}
            />
          )}
          {ROLE_LIST_GET ? null : (
            <Route
              path="/employee/role"
              render={props => (
                <RoleContainer hide={this.props.hide} {...props} />
              )}
            />
          )}
          {AUTH_LIST_GET ? null : (
            <Route
              path="/employee/authen"
              render={props => (
                <AuthenContainer hide={this.props.hide} {...props} />
              )}
            />
          )}

          <Route
            exact
            path="/employee"
            render={props => <Redirect to="/employee/list" />}
          />
        </div>
      </div>
    )
  }
}
const mapStateToProps = (state, ownProps) => ({
  forbiddenStatus: state.setAuthenData.forbiddenStatus
})
export default withRouter(
  connect(mapStateToProps, {
    changeEmployee
  })(EmployeeDisp)
)
