import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { asyncComponent } from '../../component/asyncComponent'

const EmployeeList = asyncComponent(() =>
  import(/* webpackChunkName: "employeeList" */ './employeeList')
)
const EmployeeInfo = asyncComponent(() =>
  import(/* webpackChunkName: "employeeInfo" */ './employeeInfo')
)

class EmployeeContainer extends React.Component {
  render() {
    const { forbiddenStatus } = this.props
    const { EMPLOYEE_LIST_GET, EMPLOYEE_AND_OR_EDIT } = forbiddenStatus
    return (
      <div>
        <Switch>
          {EMPLOYEE_AND_OR_EDIT ? null : (
            <Route
              path="/employee/list/detail/:id"
              render={props => (
                <EmployeeInfo hide={this.props.hide} {...props} />
              )}
            />
          )}
          {EMPLOYEE_AND_OR_EDIT ? null : (
            <Route
              path="/employee/list/add"
              render={props => (
                <EmployeeInfo hide={this.props.hide} {...props} />
              )}
            />
          )}
          {EMPLOYEE_LIST_GET ? null : (
            <Route
              path="/employee/list"
              render={props => (
                <EmployeeList hide={this.props.hide} {...props} />
              )}
            />
          )}
        </Switch>
      </div>
    )
  }
}

export default EmployeeContainer
