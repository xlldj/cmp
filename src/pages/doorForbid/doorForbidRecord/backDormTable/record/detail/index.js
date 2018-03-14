import React from 'react'
import { Table, Badge, Button } from 'antd'
import CONSTANTS from '../../../../../../constants'
import LoadingMask from '../../../../../component/loadingMask'
import closeBtn from '../../../../../assets/close.png'
import { checkObject } from '../../../../../../util/checkSame'
import Noti from '../../../../../../util/noti'

import CheckSelect from '../../../../../component/checkSelect'
import RangeSelect from '../../../../../component/rangeSelect'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

import '../../../../style/style.css'

import {
  changeDoorForbid,
  fetchDoorForbidList
} from '../../../../../../actions'

const SIZE = CONSTANTS.PAGINATION
const subModule = 'backDormRecord'

class BackDormRecordDetail extends React.Component {
  componentWillReceiveProps(nextProps) {
    try {
      this.handleDoorForbidDetail(nextProps, this.props)
      this.props = nextProps
    } catch (e) {
      console.log(e)
    }
  }

  handleDoorForbidDetail = (newProps, oldProps) => {
    if (checkObject(newProps, oldProps, ['page', 'schoolId'])) {
      return
    }
    if (!checkObject(newProps, oldProps, ['detail_show'])) {
      let { detail_show } = newProps
      let root = document.getElementById('root')
      if (detail_show) {
        root.addEventListener('click', this.closeDetail, false)
      } else {
        root.removeEventListener('click', this.closeDetail, false)
      }
    }
    let { schoolId, page, buildingId } = newProps
    const body = {}

    if (buildingId !== 'all') {
      body.buildingId = buildingId
    }
    if (schoolId !== 'all') {
      body.schoolId = schoolId
    }
    body.page = page
    body.size = CONSTANTS.PAGINATION
    newProps.fetchDetailRecordList(body, subModule)
  }

  componentDidMount() {
    this.columns = [
      {
        title: '时间',
        dataIndex: 'time',
        className: 'firstCol'
      },
      {
        title: '目的',
        dataIndex: 'dir',
        width: '25%'
      },
      {
        title: '打卡手机型号',
        dataIndex: 'model',
        width: '25%'
      },
      {
        title: '标记',
        dataIndex: 'status',
        width: '25%'
      }
    ]
  }

  componentWillUnmount() {
    let root = document.getElementById('root')
    root.removeEventListener('click', this.closeDetail, false)
  }

  closeDetail = e => {
    let { detail_show } = this.props
    if (!detail_show) {
      return
    }
    let target = e.target
    let detailWrapper = this.refs.detailWrapper
    if (detailWrapper.contains(target)) {
      console.log('contain')
      return
    }
    if (detail_show) {
      this.props.changeDoorForbid(subModule, {
        record_selectedRowIndex: -1,
        detail_show: false,
        detail_recordInfo: {},
        detail_loading: false,
        detail_total: '',
        detail_startTime: '',
        detail_endTime: '',
        detail_page: '',
        detail_dataSource: [],
        detail_timeType: 1,
        detail_formType: 1
      })
    }
  }

  changePage = pageObj => {
    let page = pageObj.current
    this.props.changeDoorForbid(subModule, { detail_page: page })
  }

  changeStartTime = time => {
    let { detail_startTime } = this.props
    if (detail_startTime !== time) {
      this.props.changeDoorForbid(subModule, {
        detail_startTime: time
      })
    }
  }
  changeEndTime = time => {
    let { detail_startTime, detail_endTime } = this.props
    if (detail_startTime > time && detail_endTime !== 0) {
      Noti.hintLock('操作有误', '结束时间不能小于起始时间')
      return
    }
    if (detail_endTime !== time) {
      this.props.changeDoorForbid(subModule, {
        detail_endTime: time
      })
    }
  }

  confirmTimeRange = () => {
    let { detail_startTime, detail_endTime } = this.props
    if (!detail_startTime || !detail_endTime) {
      return
    }
    this.props.changeDoorForbid(subModule, {
      detail_timeType: 0
    })
  }

  changeTimeType = e => {
    let { detail_timeType } = this.props
    if (detail_timeType !== e) {
      this.props.changeDoorForbid(subModule, {
        detail_timeType: e,
        page: 1,
        detail_startTime: '',
        detail_endTime: ''
      })
    }
  }

  changeformType = e => {
    let { detail_formType } = this.props
    if (detail_formType !== e) {
      this.props.changeDoorForbid(subModule, {
        detail_formType: e,
        page: 1
      })
    }
  }

  closeButtonClick = e => {
    this.props.changeDoorForbid(subModule, {
      selectedRowIndex: -1,
      detail_show: false,
      detail_recordInfo: {},
      detail_loading: false,
      detail_total: '',
      detail_startTime: '',
      detail_endTime: '',
      detail_page: '',
      detail_dataSource: [],
      detail_timeType: 1,
      detail_formType: 1
    })
  }

  unbindButtonClicked = e => {}
  render() {
    const {
      detail_recordInfo,
      detail_show,
      detail_page,
      detail_total,
      detail_dataSource,
      detail_loading,
      detail_timeType,
      detail_startTime,
      detail_endTime,
      detail_formType
    } = this.props

    const {
      nickName,
      name,
      studentNo,
      mobile,
      sex,
      grade,
      dormitory,
      schoolName,
      lastCheckType
    } = detail_recordInfo

    // const { loading } = this.state
    return (
      <div
        className={
          detail_show
            ? 'backDormDetailWrapper slideLeft'
            : 'backDormDetailWrapper hidden'
        }
        ref="detailWrapper"
      >
        {detail_loading ? (
          <div className="backDorm-loadWrapper">
            <LoadingMask />
          </div>
        ) : null}
        <div className="backDormDetail-header">
          <h3>归寝详情</h3>
          <button className="closeBtn" onClick={this.closeButtonClick}>
            <img src={closeBtn} alt="X" />
          </button>
        </div>

        <div className="backDormDetail-content">
          <h3>{name + ' ' + schoolName}</h3>
          <ul className="detaiList">
            <li>
              <label>手机号:</label>
              <span>{mobile}</span>
            </li>
            <li>
              <label>昵称:</label>
              <span>{nickName}</span>
            </li>
            <li>
              <label>学号:</label>
              <span>{studentNo}</span>
            </li>
            <li>
              <label>姓名:</label>
              <span>{name}</span>
            </li>
            <li>
              <label>性别:</label>
              <span>{sex === 1 ? '男' : '女'}</span>
            </li>
            <li>
              <label>年级:</label>
              <span>{grade}</span>
            </li>
            <li>
              <label>宿舍:</label>
              <span>{dormitory}</span>
            </li>

            <li>
              <label>当前归寝状态: </label>
              <Badge
                status={
                  lastCheckType === 1
                    ? 'success'
                    : lastCheckType === 2 ? 'warning' : 'error'
                }
                text={
                  lastCheckType === 1
                    ? '已归寝'
                    : lastCheckType === 2 ? '晚归寝' : '未归寝'
                }
              />
            </li>
          </ul>

          <div className="leftButton">
            <Button
              className="leftBtn"
              type="primary"
              onClick={this.unbindButtonClicked}
            >
              解除绑定
            </Button>
          </div>
        </div>

        <div className="queryPanel">
          <div className="queryLine">
            <div className="block">
              <span>时间筛选:</span>
              <CheckSelect
                options={CONSTANTS.DOORFORBID_RECORD_TIME}
                value={detail_timeType}
                onClick={this.changeTimeType}
              />
              <RangeSelect
                className="task-rangeSelect"
                startTime={detail_startTime}
                endTime={detail_endTime}
                changeStartTime={this.changeStartTime}
                changeEndTime={this.changeEndTime}
                confirm={this.confirmTimeRange}
              />
            </div>
          </div>

          <div className="queryLine">
            <div className="block">
              <span>表格类型:</span>
              <CheckSelect
                options={CONSTANTS.DOORFORBID_FORM}
                value={detail_formType}
                onClick={this.changeformType}
              />
            </div>
          </div>
        </div>

        <div className="tableList">
          <Table
            loading={detail_loading}
            bordered
            rowKey={record => record.id}
            pagination={{
              pageSize: SIZE,
              current: detail_page,
              total: detail_total
            }}
            dataSource={detail_dataSource}
            columns={this.columns}
            onChange={this.changePage}
          />
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  detail_show: state.doorForbidModule[subModule].detail_show,
  detail_loading: state.doorForbidModule[subModule].detail_,
  detail_total: state.doorForbidModule[subModule].detail_total,
  detail_startTime: state.doorForbidModule[subModule].detail_startTime,
  detail_endTime: state.doorForbidModule[subModule].detail_endTime,
  detail_page: state.doorForbidModule[subModule].detail_page,
  detail_dataSource: state.doorForbidModule[subModule].detail_dataSource,
  detail_timeType: state.doorForbidModule[subModule].detail_timeType,
  detail_formType: state.doorForbidModule[subModule].detail_formType,
  detail_recordInfo: state.doorForbidModule[subModule].detail_recordInfo
})
export default withRouter(
  connect(mapStateToProps, {
    changeDoorForbid,
    fetchDoorForbidList
  })(BackDormRecordDetail)
)
