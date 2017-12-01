import React from 'react'
import { Route, Switch, Redirect} from 'react-router-dom'
import Bread from '../bread'
import './style/style.css'

import {asyncComponent} from '../component/asyncComponent'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeTask } from '../../actions'

const TaskLog = asyncComponent(()=>import(/* webpackChunkName: "taskLog" */ "./log/taskLog"))
const TaskList = asyncComponent(()=>import(/* webpackChunkName: "taskList" */ "./taskList"))
const Complaint = asyncComponent(()=>import(/* webpackChunkName: "complaint" */ "./complaint/complaint"))
const Feedback = asyncComponent(()=>import(/* webpackChunkName: "feedback" */ "./feedback/feedback"))
const Abnormal = asyncComponent(()=>import(/* webpackChunkName: "abnormal" */ "./abnormal/abnormal"))

const breadcrumbNameMap = {
  '/list': '工单列表',
  '/log': '工作记录列表',
  '/log/add': '创建工作记录',
  '/log/detail': '详情',
  '/complaint': '账单投诉',
  '/feedback': '意见反馈',
  '/abnormal': '异常订单'
}

class TaskDisp extends React.Component {
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
  render () {
    return (
      <div>
        <div className='breadc'>
          <Bread breadcrumbNameMap={breadcrumbNameMap} single={false} parent='task'
            setStatusFortask={this.setStatusFortask}
            clearStatus4taskIIlist={this.clearStatus4taskIIlist}
            clearStatus4taskIIlog={this.clearStatus4taskIIlog}
            clearStatus4taskIIabnormal={this.clearStatus4taskIIabnormal}
            clearStatus4taskIIcomplaint={this.clearStatus4taskIIcomplaint}
            clearStatus4taskIIfeedback={this.clearStatus4taskIIfeedback}
            parentName='客服工单' 
          />
        </div>

        <div className='disp'>
          <Switch >
            <Route path='/task/log' render={(props) => (<TaskLog hide={this.props.hide} {...props} />)} />
            <Route path='/task/list' render={(props) => (<TaskList hide={this.props.hide} {...props} />)} />
            <Route path='/task/complaint' render={(props) => (<Complaint hide={this.props.hide} {...props} />)} />
            <Route path='/task/feedback' render={(props) => (<Feedback hide={this.props.hide} {...props} />)} />
            <Route path='/task/abnormal' render={(props) => (<Abnormal hide={this.props.hide} {...props} />)} />
            <Route exact path='/task' render={(props) => (<Redirect to='/task/list' />)} />
          </Switch>
        </div>
      </div>
    )
  }
}

// export default TaskDisp
export default withRouter(connect(null, {
  changeTask
})(TaskDisp))
