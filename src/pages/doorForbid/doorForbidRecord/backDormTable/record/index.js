import React from 'react'

import { Table, Badge } from 'antd'
import CheckSelect from '../../../../component/checkSelect'
import RangeSelect from '../../../../component/rangeSelect'
import CONSTANTS from '../../../../../constants'
import Time from '../../../../../util/time'
import SearchInput from '../../../../component/searchInput'
import Noti from '../../../../../util/noti'
import selectedImg from '../../../../assets/selected.png'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeDoorForbid } from '../../../../../actions'

const SIZE = CONSTANTS.PAGINATION
const subModule = 'backDormRecord'

class BackDormRecordTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  changePage = pageObj => {
    let page = pageObj.current
    this.props.changeDoorForbid(subModule, { record_page: page })
  }

  changeStartTime = time => {
    let { record_startTime } = this.props
    if (record_startTime !== time) {
      this.props.changeDoorForbid(subModule, {
        record_startTime: time
      })
    }
  }
  changeEndTime = time => {
    let { record_startTime, record_endTime } = this.props
    if (record_startTime > time && record_startTime !== 0) {
      Noti.hintLock('操作有误', '结束时间不能小于起始时间')
      return
    }
    if (record_endTime !== time) {
      this.props.changeDoorForbid(subModule, {
        record_endTime: time
      })
    }
  }

  confirmTimeRange = () => {
    let { record_startTime, record_endTime } = this.props
    if (!record_startTime || !record_endTime) {
      return
    }
    this.props.changeDoorForbid(subModule, {
      record_timeType: 0
    })
  }
  settingBackDormTime = v => {}

  changeSearch = e => {
    let { record_searchKey } = this.props
    if (record_searchKey !== e) {
      this.props.changeDoorForbid(subModule, {
        record_searchKey: e,
        page: 1
      })
    }
  }
  changeSexType = e => {
    let { record_sexType } = this.props
    if (record_sexType !== e) {
      this.props.changeDoorForbid(subModule, {
        record_sexType: e,
        page: 1
      })
    }
  }

  changeTimeType = e => {
    let { record_timeType } = this.props
    if (record_timeType !== e) {
      this.props.changeDoorForbid(subModule, {
        record_timeType: e,
        page: 1,
        record_startTime: '',
        record_endTime: ''
      })
    }
  }

  changeBackDormStatus = e => {
    let { record_backDormStatus } = this.props
    if (record_backDormStatus !== e) {
      this.props.changeDoorForbid(subModule, {
        record_backDormStatus: e,
        page: 1
      })
    }
  }

  onRowClick = (record, index, e) => {
    let { record_selectedRowIndex } = this.props
    if (record_selectedRowIndex !== e) {
      this.props.changeDoorForbid(subModule, {
        record_selectedRowIndex: index,
        detail_recordInfo: record,
        detail_show: true
      })
    }
  }

  render() {
    const {
      record_loading,
      record_total,
      record_startTime,
      record_endTime,
      record_page,
      record_dataSource,
      record_searchKey,
      record_timeType,
      record_sexType,
      record_backDormStatus,
      record_selectedId,
      record_selectedRowIndex
    } = this.props

    this.columns = [
      {
        title: '姓名',
        dataIndex: 'name',
        className: 'firstCol selectedHintWraper',
        width: '8%',
        render: (text, record, index) => (
          <span className="">
            {index === record_selectedRowIndex ? (
              <img src={selectedImg} alt="" className="selectedImg" />
            ) : null}
            {text}
          </span>
        )
      },
      {
        title: '学号',
        dataIndex: 'studentNo',
        width: '12%'
        // render: (text, record) =>
        //   record.createTime ? Time.getTimeStr(record.createTime) : ''
      },
      {
        title: '手机号',
        dataIndex: 'mobile',
        width: '12%'
      },
      {
        title: '性别',
        dataIndex: 'sex',
        width: '8%'
      },
      {
        title: '年级',
        dataIndex: 'grade',
        width: '8%'
      },
      {
        title: '宿舍',
        dataIndex: 'dormitory',
        width: '8%'
      },
      {
        title: '最近一次打卡',
        dataIndex: 'lastCheckTime',
        width: '12%'
      },
      {
        title: '归寝状态',
        dataIndex: 'lastCheckType',
        width: '12%',
        render: (text, record, index) => {
          switch (record.lastCheckType) {
            case 1:
              return <Badge status="success" text="已归寝" />
            case 2:
              return <Badge status="warning" text="晚归寝" />
            case 3:
              return <Badge status="error" text="未归寝" />
            default:
              return <Badge status="warning" text="未知" />
          }
        }
      }
    ]
    const backDormStateTitle =
      (record_backDormStatus === 1
        ? '所有'
        : CONSTANTS.DOORFORBID_RECORD_BACKDORM_STATUS[record_backDormStatus]) +
      '人数:' +
      record_total +
      '人'
    return (
      <div className="doorForbidReportTab">
        <div className="queryPanel">
          <div className="queryLine">
            <div className="block">
              <span>时间筛选:</span>
              <CheckSelect
                options={CONSTANTS.DOORFORBID_RECORD_TIME}
                value={record_timeType}
                onClick={this.changeTimeType}
              />
              <RangeSelect
                className="task-rangeSelect"
                startTime={record_startTime}
                endTime={record_endTime}
                changeStartTime={this.changeStartTime}
                changeEndTime={this.changeEndTime}
                confirm={this.confirmTimeRange}
              />
            </div>
            <div className="block">
              <SearchInput
                placeholder="姓名/手机号/宿舍"
                searchingText={record_searchKey}
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
                value={record_sexType}
                onClick={this.changeSexType}
              />
            </div>
          </div>

          <div className="queryLine">
            <div className="block">
              <span>归寝状态:</span>
              <CheckSelect
                options={CONSTANTS.DOORFORBID_RECORD_BACKDORM_STATUS}
                value={record_backDormStatus}
                onClick={this.changeBackDormStatus}
              />
            </div>
            <div className="block">
              <span className="mgr10">{backDormStateTitle}</span>
            </div>
          </div>
        </div>

        <div className="tableList">
          <Table
            loading={record_loading}
            bordered
            rowKey={record => record.id}
            pagination={{
              pageSize: SIZE,
              current: record_page,
              total: record_total
            }}
            dataSource={record_dataSource}
            columns={this.columns}
            onChange={this.changePage}
            onRowClick={this.onRowClick}
          />
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  record_loading: state.doorForbidModule[subModule].record_loading,
  record_total: state.doorForbidModule[subModule].record_total,
  record_startTime: state.doorForbidModule[subModule].record_startTime,
  record_endTime: state.doorForbidModule[subModule].record_endTime,
  record_page: state.doorForbidModule[subModule].record_page,
  record_dataSource: state.doorForbidModule[subModule].record_dataSource,
  record_searchKey: state.doorForbidModule[subModule].record_searchKey,
  record_timeType: state.doorForbidModule[subModule].record_timeType,
  record_sexType: state.doorForbidModule[subModule].record_sexType,
  record_backDormStatus:
    state.doorForbidModule[subModule].record_backDormStatus,
  record_selectedId: state.doorForbidModule[subModule].record_selectedId,
  record_selectedRowIndex:
    state.doorForbidModule[subModule].record_selectedRowIndex
})
export default withRouter(
  connect(mapStateToProps, {
    changeDoorForbid
  })(BackDormRecordTable)
)
