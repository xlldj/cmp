import React from 'react'
import {Switch, Route} from 'react-router-dom'
import {asyncComponent} from '../../component/asyncComponent'

const TaskLogList = asyncComponent(()=>import(/* webpackChunkName: "taskLogList" */ "./taskLogList"))
const TaskLogDetail = asyncComponent(()=>import(/* webpackChunkName: "taskLogDetail" */ "./taskLogDetail"))

class TaskLog extends React.Component {
  render () {
    return (
      <Switch>
        <Route exact path='/task/log' render={(props) => (<TaskLogList hide={this.props.hide} {...props} />)} />
        <Route path='/task/log/add' render={(props) => (<TaskLogDetail hide={this.props.hide} {...props} />)} />
        <Route path='/task/log/detail/:id' render={(props) => (<TaskLogDetail hide={this.props.hide} {...props} />)} />
      </Switch>
    )
  }
}

export default TaskLog
