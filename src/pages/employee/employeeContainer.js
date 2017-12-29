import React from 'react'
import { Route, Switch} from 'react-router-dom'
import {asyncComponent} from '../component/asyncComponent'

const EmployeeList = asyncComponent(()=>import(/* webpackChunkName: "employeeList" */ "./employeeList"))
const EmployeeInfo = asyncComponent(()=>import(/* webpackChunkName: "employeeInfo" */ "./employeeInfo"))

class EmployeeContainer extends React.Component {
  render () {
    return (
      <div>
        <Switch>
          <Route path='/employee/list/detail/:id' render={(props) => (<EmployeeInfo changeCurrentName={this.props.changeCurrentName} hide={this.props.hide} {...props} />)} />
          <Route path='/employee/list/add' render={(props) => (<EmployeeInfo changeCurrentName={this.props.changeCurrentName} hide={this.props.hide} {...props} />)} />
          <Route path='/employee/list' render={(props) => (<EmployeeList hide={this.props.hide} {...props} />)} />
        </Switch>
      </div>
    )
  }
}

export default EmployeeContainer 
