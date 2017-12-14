import React from 'react'
import { Route, Switch, Redirect} from 'react-router-dom'
import Bread from '../bread'
import './style/style.css'

import {asyncComponent} from '../component/asyncComponent'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeTask } from '../../actions'

import {getLocal} from '../util/storage'
const TaskLog = asyncComponent(()=>import(/* webpackChunkName: "taskLog" */ "./log/taskLog"))
const TaskList = asyncComponent(()=>import(/* webpackChunkName: "taskList" */ "./taskList"))
const Complaint = asyncComponent(()=>import(/* webpackChunkName: "complaint" */ "./complaint/complaint"))
const Feedback = asyncComponent(()=>import(/* webpackChunkName: "feedback" */ "./feedback/feedback"))

const breadcrumbNameMap = {
  '/list': '工单列表',
  '/log': '工作记录列表',
  '/log/add': '创建工作记录',
  '/log/detail': '详情',
  '/complaint': '账单投诉',
  '/feedback': '意见反馈'
}

class TaskDisp extends React.Component {
  setStatusFortask = () => {
    /* 工单列表的状态不需要在离开后改变 */
    // this.clearStatus4taskIIlist()
  }
  clearStatus4taskIIlist = () => {
    /* 工单列表的状态不需要在离开后改变 */
    /* const taskList = 'taskList'
    this.getDefaultSchool()
    this.props.changeTask(taskList, {page: 1, assigned: false, sourceType: 'all', pending: 'all', all: '1'})
    */
  }
  clearStatus4IIlog = () => {
    this.getDefaultSchool()
    this.props.changeTask('log', {page: 1, all: '1'})
  }
  clearStatus4taskIIcomplaint = () => {
    this.getDefaultSchool()
    this.props.changeTask('complaint', {page: 1, type: 'all', status: 'all', selectKey: ''})
  }
  clearStatus4taskIIfeedback = () => {
    this.getDefaultSchool()
    this.props.changeTask('feedback', {page: 1})
  }
  getDefaultSchool = () => {
    const recentSchools = getLocal('recentSchools'), defaultSchool = getLocal('defaultSchool')
    var selectedSchool = 'all'
    if (recentSchools) {
      let recent = recentSchools.split(',')
      let schoolId = recent[0]
      selectedSchool = schoolId
    } else if (defaultSchool) {
      selectedSchool = defaultSchool
    }
    if (selectedSchool !== 'all') {
      // this.props.changeTask('taskList', {schoolId: selectedSchool})
      this.props.changeTask('log', {schoolId: selectedSchool})
      this.props.changeTask('complaint', {schoolId: selectedSchool})
      this.props.changeTask('feedback', {schoolId: selectedSchool})
    }
  }
  render () {
    return (
      <div>
        <div className='breadc'>
          <Bread breadcrumbNameMap={breadcrumbNameMap} single={false} parent='task'
            setStatusFortask={this.setStatusFortask}
            clearStatus4taskIIlist={this.clearStatus4taskIIlist}
            clearStatus4taskIIlog={this.clearStatus4taskIIlog}
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
