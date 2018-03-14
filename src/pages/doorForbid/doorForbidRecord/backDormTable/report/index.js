import React from 'react'

import { Table } from 'antd'
import CheckSelect from '../../../../component/checkSelect'
import RangeSelect from '../../../../component/rangeSelect'
import CONSTANTS from '../../../../../constants'
import SearchInput from '../../../../component/searchInput'
import Noti from '../../../../../util/noti'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeDoorForbid } from '../../../../../actions'

const SIZE = CONSTANTS.PAGINATION
const subModule = 'backDormRecord'

class BackDormReportTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.columns = [
      {
        title: '姓名',
        dataIndex: 'name',
        className: 'firstCol'
      },
      {
        title: '学号',
        dataIndex: 'studentNo',
        width: '12%'
      },
      {
        title: '手机号',
        dataIndex: 'mobile',
        width: '12%'
      },
      {
        title: '性别',
        dataIndex: 'sex',
        width: '8%',
        render: (text, record) => (record.sex === 1 ? '男' : '女')
      },
      {
        title: '宿舍',
        dataIndex: 'dormitory',
        width: '8%'
      },
      {
        title: '总打卡次数',
        dataIndex: 'total',
        orderBy: 'total',
        width: '8%',
        sorter: true
      },
      {
        title: '异常打卡次数',
        dataIndex: 'abnormal',
        orderBy: 'abnormal',
        width: '8%',
        sorter: true
      },
      {
        title: '正常归寝次数',
        dataIndex: 'normal',
        orderBy: 'normal',
        width: '8%',
        sorter: true
      },
      {
        title: '晚归次数',
        dataIndex: 'late',
        orderBy: 'late',
        width: '8%',
        sorter: true
      },

      {
        title: '未归次数',
        dataIndex: 'notReturn',
        orderBy: 'notReturn',
        width: '8%'
      }
    ]
  }

  changeTable = (pageObj, filters, sorter) => {
    debugger
    console.log(sorter)
    let { order, field } = sorter
    let { report_order, report_orderBy } = this.props
    if (order) {
      report_orderBy = field
      report_order = order === 'ascend' ? 1 : 2
    } else {
      report_orderBy = ''
      report_order = 0
    }
    let page = pageObj.current

    this.props.changeDoorForbid(subModule, {
      report_page: page,
      report_orderBy: report_orderBy,
      report_order: report_order
    })
  }
  changePage = pageObj => {
    debugger
    let page = pageObj.current
    this.props.changeDoorForbid(subModule, { report_page: page })
  }

  changeStartTime = time => {
    let { report_startTime } = this.props
    if (report_startTime !== time) {
      this.props.changeDoorForbid(subModule, {
        report_startTime: time
      })
    }
  }
  changeEndTime = time => {
    let { report_startTime, report_endTime } = this.props
    if (report_startTime > time && report_startTime !== 0) {
      Noti.hintLock('操作有误', '结束时间不能小于起始时间')
      return
    }
    if (report_endTime !== time) {
      this.props.changeDoorForbid(subModule, {
        report_endTime: time
      })
    }
  }

  confirmTimeRange = () => {
    let { report_startTime, report_endTime } = this.props
    if (!report_startTime || !report_endTime) {
      return
    }

    this.props.changeDoorForbid(subModule, {
      report_timeType: 0
    })
  }
  settingBackDormTime = v => {}

  changeSearch = e => {
    let { report_searchKey } = this.props
    if (report_searchKey !== e) {
      this.props.changeDoorForbid(subModule, {
        report_searchKey: e,
        page: 1
      })
    }
  }
  changeSexType = e => {
    let { report_sexType } = this.props
    if (report_sexType !== e) {
      this.props.changeDoorForbid(subModule, {
        report_sexType: e,
        page: 1
      })
    }
  }

  changeTimeType = e => {
    let { report_timeType } = this.props
    if (report_timeType !== e) {
      this.props.changeDoorForbid(subModule, {
        report_timeType: e,
        page: 1,
        report_startTime: '',
        report_endTime: ''
      })
    }
  }
  render() {
    const {
      report_loading,
      report_total,
      report_startTime,
      report_endTime,
      report_page,
      report_dataSource,
      report_searchKey,
      report_timeType,
      report_sexType
    } = this.props

    return (
      <div className="doorForbidReportTab">
        <div className="queryPanel">
          <div className="queryLine">
            <div className="block">
              <span>时间筛选:</span>
              <CheckSelect
                options={CONSTANTS.DOORFORBID_REPORT_TIME}
                value={report_timeType}
                onClick={this.changeTimeType}
              />
              <RangeSelect
                className="task-rangeSelect"
                startTime={report_startTime}
                endTime={report_endTime}
                changeStartTime={this.changeStartTime}
                changeEndTime={this.changeEndTime}
                confirm={this.confirmTimeRange}
              />
            </div>
            <div className="block">
              <SearchInput
                placeholder="姓名/手机号/宿舍"
                searchingText={report_searchKey}
                pressEnter={this.searchEnter}
                changeSearch={this.changeSearch}
              />
            </div>
          </div>

          <div className="queryLine">
            <div className="block">
              <span>性别筛选:</span>
              <CheckSelect
                options={CONSTANTS.DOORFORBID_SEX}
                value={report_sexType}
                onClick={this.changeSexType}
              />
            </div>
          </div>
        </div>

        <div className="tableList">
          <Table
            loading={report_loading}
            bordered
            rowKey={record => record.id}
            pagination={{
              pageSize: SIZE,
              current: report_page,
              total: report_total
            }}
            dataSource={report_dataSource}
            columns={this.columns}
            onChange={this.changeTable}
          />
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  report_loading: state.doorForbidModule[subModule].report_loading,
  report_total: state.doorForbidModule[subModule].report_total,
  report_startTime: state.doorForbidModule[subModule].report_startTime,
  report_endTime: state.doorForbidModule[subModule].report_endTime,
  report_page: state.doorForbidModule[subModule].report_page,
  report_dataSource: state.doorForbidModule[subModule].report_dataSource,
  report_searchKey: state.doorForbidModule[subModule].report_searchKey,
  report_timeType: state.doorForbidModule[subModule].report_timeType,
  report_sexType: state.doorForbidModule[subModule].report_sexType,
  report_orderBy: state.doorForbidModule[subModule].report_orderBy,
  report_order: state.doorForbidModule[subModule].report_order
})
export default withRouter(
  connect(mapStateToProps, {
    changeDoorForbid
  })(BackDormReportTable)
)
