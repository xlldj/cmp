import React from 'react'
import { Table } from 'antd'

import Time from '../../../util/time'
import selectedImg from '../../assets/selected.png'
import CONSTANTS from '../../../constants'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeTask, setUserInfo, changeOnline } from '../../../actions'
const moduleName = 'taskModule'
const subModule = 'taskListContainer'
const modalName = 'taskModal'

const {
  PAGINATION: SIZE,
  TASKTYPE,
  TASK_LIST_TAB_PENDING,
  TASK_LIST_TAB_FINISHED,
  TAB_TO_REDUX_NAME
} = CONSTANTS
const classLevel = {
  1: '',
  2: 'yellowfc',
  3: 'red'
}
class TaskListTable extends React.Component {
  getColumns = () => {
    const { selectedRowIndex, tabIndex } = this.props
    const TIMETITLE = tabIndex === TASK_LIST_TAB_FINISHED ? '用时' : '等待时间'
    const columns = [
      {
        title: '工单编号',
        dataIndex: 'id',
        className: 'firstCol selectedHintWraper',
        width: '8%',
        render: (text, record, index) => (
          <span className="">
            {index === selectedRowIndex ? (
              <img src={selectedImg} alt="" className="selectedImg" />
            ) : null}
            {text}
          </span>
        )
      },
      {
        title: '学校',
        dataIndex: 'schoolName',
        width: '10%'
      },
      {
        title: '工单类型',
        dataIndex: 'type',
        width: '8%',
        render: text => TASKTYPE[text]
      },
      {
        title: '发起人',
        dataIndex: 'creatorName',
        width: '10%'
      },
      {
        title: '受理人',
        dataIndex: 'assignName',
        width: '10%'
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        width: '14%',
        render: (text, record) => Time.getTimeStr(text)
      },
      {
        title: <span>{TIMETITLE}</span>,
        dataIndex: 'endTime',
        width: '14%',
        render: (text, record, index) => {
          if (record.status === 5 || record.status === 6) {
            return record.endTime
              ? Time.getTimeInterval(record.createTime, record.endTime)
              : Time.getSpan(record.createTime)
          } else {
            return record.createTime ? Time.getSpan(record.createTime) : ''
          }
        }
      }
    ]

    const handlingColumns = [
      {
        title: '工单编号',
        dataIndex: 'id',
        className: 'firstCol selectedHintWraper',
        width: '8%',
        render: (text, record, index) => (
          <span className="">
            {index === selectedRowIndex ? (
              <img src={selectedImg} alt="" className="selectedImg" />
            ) : null}
            {text}
          </span>
        )
      },
      {
        title: '学校',
        dataIndex: 'schoolName',
        width: '10%'
      },
      {
        title: '工单类型',
        dataIndex: 'type',
        width: '8%',
        render: text => CONSTANTS.TASKTYPE[text]
      },
      {
        title: '发起人',
        dataIndex: 'creatorName',
        width: '8%'
      },
      {
        title: '受理人',
        dataIndex: 'assignName',
        width: '8%'
      },
      {
        title: '紧急程度',
        dataIndex: 'level',
        width: '8%',
        render: (text, record) => (
          <span className={classLevel[record.level]}>
            {CONSTANTS.PRIORITY[text]}
          </span>
        )
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        width: '12%',
        render: (text, record) => Time.getTimeStr(text)
      },
      {
        title: <span>{TIMETITLE}</span>,
        dataIndex: 'endTime',
        width: '12%',
        render: (text, record, index) => {
          if (record.status === 5 || record.status === 6) {
            return record.endTime
              ? Time.getTimeInterval(record.createTime, record.endTime)
              : Time.getSpan(record.createTime)
          } else {
            return record.createTime ? Time.getSpan(record.createTime) : ''
          }
        }
      }
    ]
    return tabIndex === TASK_LIST_TAB_PENDING ? handlingColumns : columns
  }

  changePage = pageObj => {
    let page = pageObj.current
    const { tabIndex } = this.props
    const subModule = TAB_TO_REDUX_NAME[tabIndex]
    this.props.changeTask(subModule, { page })
  }

  setRowClass = (record, index) => {
    let { selectedRowIndex } = this.props
    if (index === selectedRowIndex) {
      return 'selectedRow'
    } else {
      return ''
    }
  }
  selectRow = (record, index, event) => {
    let { dataSource } = this.props
    // let page = panel_page[main_phase]
    let id = dataSource && dataSource[index] && dataSource[index].id
    this.props.changeTask(subModule, {
      selectedRowIndex: index,
      showDetail: true,
      selectedDetailId: id
    })
    // 将详情中的tab页置为1
    this.props.changeTask('taskDetail', {
      currentTab: 1
    })
  }
  render() {
    const { listLoading, tabIndex, total, dataSource } = this.props
    const reduxStateName = TAB_TO_REDUX_NAME[tabIndex]
    const currentReduxState = this.props[reduxStateName]
    const { page } = currentReduxState
    return (
      <div className="tableList">
        <Table
          bordered
          loading={listLoading}
          rowKey={record => record.id}
          pagination={{
            pageSize: SIZE,
            current: page,
            total: total
          }}
          // dataSource={panel_dataSource[main_phase]}
          dataSource={dataSource}
          columns={this.getColumns()}
          onChange={this.changePage}
          onRowClick={this.selectRow}
          rowClassName={this.setRowClass}
        />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  selectedRowIndex: state[moduleName][subModule].selectedRowIndex,
  dataSource: state[modalName].list
})

export default withRouter(
  connect(mapStateToProps, {
    changeTask,
    setUserInfo,
    changeOnline
  })(TaskListTable)
)
