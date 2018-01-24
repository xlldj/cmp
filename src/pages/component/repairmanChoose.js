import React from 'react'
import { Modal, Table, Button } from 'antd'
import Time from '../../util/time'
import Noti from '../../util/noti'
import AjaxHandler from '../../util/ajax'
import CONSTANTS from './constants'
const { TASK_BUILD_CMP } = CONSTANTS

class RepairmanTable extends React.Component {
  constructor(props) {
    super(props)
    let dataSource = []
    this.state = {
      dataSource,
      selectedRowKeys: '',
      priority: 1,
      remark: '',
      schoolId: 0,
      posting: false
    }
  }
  fetchData = () => {
    let { schoolId } = this.props
    let resource = '/api/employee/department/member/list'
    const body = {
      page: 1,
      size: 10000,
      department: CONSTANTS.EMPLOYEE_REPAIRMAN
    }
    if (schoolId) {
      body.schoolId = schoolId
    }
    const cb = json => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        /*--------redirect --------*/
        if (json.data) {
          this.setState({
            dataSource: json.data.employees
          })
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  componentDidMount() {
    // console.log('repairman mount')
    let { schoolId, level } = this.props
    let nextState = {}
    if (schoolId) {
      nextState.schoolId = schoolId
    }
    if (level) {
      nextState.priority = level
    }
    this.setState(nextState)
    this.fetchData()
  }
  componentWillReceiveProps(nextProps) {
    let schoolId = nextProps.schoolId
    if (schoolId && schoolId !== this.state.schoolId) {
      this.setState({
        schoolId: schoolId
      })
      this.fetchData()
    }
  }
  changePriority = e => {
    let node = e.target,
      v = ''
    let priority = this.state.priority
    try {
      while (node.tagName.toLowerCase() !== 'button') {
        node = node.parentNode
      }
      v = node.getAttribute('data-value')
    } catch (e) {
      console.log(e)
    }
    if (priority === parseInt(v, 10)) {
      return
    }
    this.setState({
      priority: parseInt(v, 10)
    })
  }
  cancel = () => {
    this.props.cancel()
  }
  postData = body => {
    let resource = '/work/order/handle'
    const cb = json => {
      this.setState({
        posting: false
      })
      if (json.error) {
        Noti.hintServiceError(json.error.displayMessage)
      } else {
        /*--------redirect --------*/
        if (json.data) {
          this.props.confirm()
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb, null, {
      clearPosting: true,
      thisObj: this
    })
  }
  confirm = () => {
    if (this.state.posting) {
      return
    }
    this.setState({
      posting: true
    })
    const body = {
      type: CONSTANTS.TASK_HANDLE_REASSIGN,
      id: this.props.id,
      department: CONSTANTS.EMPLOYEE_REPAIRMAN,
      level: parseInt(this.state.priority, 10),
      assignId: this.state.selectedRowKeys[0],
      content: this.state.remark,
      env: TASK_BUILD_CMP // tell server this is from cmp, not 'light'
    }
    this.postData(body)
  }
  changeRemark = e => {
    this.setState({
      remark: e.target.value
    })
  }
  checkRemark = e => {
    let v = e.target.value.trim()
    this.setState({
      remark: v
    })
  }
  selectRow = (record, index, event) => {
    let selectedRows = [record]
    this.changeSelect(null, selectedRows)
  }
  changeSelect = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedRowKeys: [selectedRows[0].id]
    })
  }
  render() {
    const { dataSource, priority, selectedRowKeys } = this.state
    const columns = [
      {
        title: '维修员',
        dataIndex: 'name',
        width: '15%'
      },
      {
        title: '待接受的任务',
        dataIndex: 'waiting',
        width: '15%',
        render: text => text || 0
      },
      {
        title: '已接受的任务',
        dataIndex: 'accepted',
        width: '15%',
        render: text => text || 0
      },
      {
        title: '近7日完成任务',
        dataIndex: 'weeklyDone',
        width: '20%',
        render: text => text || 0
      },
      {
        title: '平均完成时间',
        dataIndex: 'avgCost',
        width: '20%',
        render: (text, record, index) => {
          return record.avgCost ? Time.formatSpan(record.avgCost) : 0
        }
      },
      {
        title: '用户评分',
        dataIndex: 'avgRating',
        width: '15%',
        render: text => text || '无'
      }
    ]
    const title = <span className="modalTitle">维修员</span>

    return (
      <Modal
        wrapClassName="modal"
        width={800}
        title={title}
        visible={this.props.showModal}
        onCancel={this.cancel}
        onOk={this.confirm}
        okText="确认"
      >
        <div className="schName">学校:{this.props.schoolName}</div>
        <div className="setRepairman">
          <Table
            rowKey={record => record.id}
            onRowClick={this.selectRow}
            rowSelection={{
              type: 'radio',
              onChange: this.changeSelect,
              selectedRowKeys: selectedRowKeys
            }}
            pagination={{ defaultPageSize: 8 }}
            dataSource={dataSource}
            columns={columns}
          />
          <div className="options">
            <div className="priorityGroup">
              <span>任务紧急程度:</span>
              <Button
                type={priority === 1 ? 'primary' : ''}
                onClick={this.changePriority}
                data-value="1"
              >
                正常处理
              </Button>
              <Button
                type={priority === 2 ? 'primary' : ''}
                onClick={this.changePriority}
                data-value="2"
              >
                优先处理
              </Button>
              <Button
                type={priority === 3 ? 'primary' : ''}
                onClick={this.changePriority}
                data-value="3"
              >
                紧急处理
              </Button>
            </div>
            <div className="customNote">
              <textarea
                placeholder="备注信息(选填)"
                className="noteInput"
                value={this.state.remark}
                onChange={this.changeRemark}
                onBlur={this.checkRemark}
              />
            </div>
          </div>
        </div>
      </Modal>
    )
  }
}

export default RepairmanTable
