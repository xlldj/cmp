import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import Bread from '../component/bread'
import './style/style.css'
import AjaxHandler from '../../util/ajax'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeTask, setTagList } from '../../actions'

import { getLocal } from '../../util/storage'
import TaskListContainer from './taskList'
import TaskReportContainer from './report/taskReport'

const breadcrumbNameMap = {
  '/list': '工单列表',
  '/report': '工作报表',
  '/quick': '快捷消息'
}

class TaskDisp extends React.Component {
  componentDidMount() {
    let { tagSet } = this.props.tagInfo
    if (!tagSet) {
      this.fetchTags()
    }
  }
  fetchTags = () => {
    let resource = '/work/order/tag/list'
    const body = {
      page: 1,
      size: 1000
    }
    const cb = json => {
      if (json.data.tags) {
        let tags = {}
        json.data.tags.forEach(r => {
          tags[r.id] = r.description
        })
        this.props.setTagList(tags)
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
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
    // this.getDefaultSchool()
    this.props.changeTask('log', { page: 1, all: '1', schoolId: 'all' })
  }
  clearStatus4taskIIcomplaint = () => {
    // this.getDefaultSchool()
    this.props.changeTask('complaint', {
      page: 1,
      type: 'all',
      status: 'all',
      selectKey: '',
      schoolId: 'all'
    })
  }
  clearStatus4taskIIfeedback = () => {
    // this.getDefaultSchool()
    this.props.changeTask('feedback', { page: 1, schoolId: 'all' })
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
      // this.props.changeTask('taskList', {schoolId: selectedSchool})
      this.props.changeTask('log', { schoolId: selectedSchool })
      this.props.changeTask('complaint', { schoolId: selectedSchool })
      this.props.changeTask('feedback', { schoolId: selectedSchool })
    }
  }
  render() {
    const { forbiddenStatus } = this.props
    const { REPORT_LIST_GET, TASK_LIST_GET } = forbiddenStatus
    return (
      <div>
        <div className="breadc">
          <Bread
            breadcrumbNameMap={breadcrumbNameMap}
            single={false}
            parent="task"
            setStatusFortask={this.setStatusFortask}
            clearStatus4taskIIlist={this.clearStatus4taskIIlist}
            parentName="客服工单"
          />
        </div>

        <div className="disp">
          <Switch>
            {TASK_LIST_GET ? null : (
              <Route
                path="/task/list"
                render={props => (
                  <TaskListContainer
                    hide={this.props.hide}
                    {...props}
                    forbiddenStatus={forbiddenStatus}
                  />
                )}
              />
            )}
            {REPORT_LIST_GET ? null : (
              <Route
                path="/task/report"
                render={props => (
                  <TaskReportContainer
                    hide={this.props.hide}
                    {...props}
                    forbiddenStatus={forbiddenStatus}
                  />
                )}
              />
            )}
            <Route
              path="/task"
              render={props => (
                <TaskReportContainer
                  hide={this.props.hide}
                  {...props}
                  forbiddenStatus={forbiddenStatus}
                />
              )}
            />
            <Route
              exact
              path="/task"
              render={props => <Redirect to="/task/list" />}
            />
          </Switch>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  tagInfo: state.setTagList,
  forbiddenStatus: state.setAuthenData.forbiddenStatus
})
// export default TaskDisp
export default withRouter(
  connect(mapStateToProps, {
    changeTask,
    setTagList
  })(TaskDisp)
)
