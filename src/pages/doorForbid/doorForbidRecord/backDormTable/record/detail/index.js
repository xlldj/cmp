import React from 'react'
import { Table, Badge, Button, Popconfirm } from 'antd'
import CONSTANTS from '../../../../../../constants'
import LoadingMask from '../../../../../component/loadingMask'
import closeBtn from '../../../../../assets/close.png'
import { checkObject } from '../../../../../../util/checkSame'
import Noti from '../../../../../../util/noti'

import CheckSelect from '../../../../../component/checkSelect'
import RangeSelect from '../../../../../component/rangeSelect'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

import {
  changeDoorForbid,
  fetchDetailRecordList
} from '../../../../../../actions'

import {
  fetchChangeBackDormStatus,
  fetchUnbindUserInDorm
} from '../../../../action'

const {
  PAGINATION: SIZE,
  DOORFORBID_RECORD_TIME,
  DOORFORBID_FORM,
  DOORFORBID_DAYTYPE,
  DOORFORBID_RECORD_BACKDORM_STATUS
  // SEX
} = CONSTANTS
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
    if (
      checkObject(newProps, oldProps, [
        'detail_page',
        'detail_formType',
        'detail_timeType',
        'detail_show',
        'detail_startTime',
        'detail_endTime'
      ])
    ) {
      return
    }

    if (!checkObject(newProps, oldProps, ['detail_show'])) {
      let { detail_show } = newProps
      let root = document.getElementById('root')
      if (detail_show) {
        root.addEventListener('click', this.closeDetail, false)
      } else {
        root.removeEventListener('click', this.closeDetail, false)
        return
      }
    }

    this.forceRefresh(newProps)
  }

  forceRefresh = newProps => {
    let {
      detail_startTime,
      detail_endTime,
      detail_page,
      detail_timeType,
      detail_formType,
      detail_recordInfo
    } = newProps
    let { memberId } = detail_recordInfo

    const body = {}

    body.page = detail_page || 1
    if (detail_timeType !== 1) {
      body.dayType = DOORFORBID_DAYTYPE[detail_timeType]
    }

    if (detail_startTime !== '' && detail_endTime !== '') {
      body.startTime = detail_startTime
      body.endTime = detail_endTime
    }
    if (memberId) {
      body.memberId = memberId
    }
    body.size = SIZE
    newProps.fetchDetailRecordList(body, subModule, detail_formType)
  }

  componentDidMount() {
    this.signInColumns = [
      {
        title: '时间',
        dataIndex: 'time',
        className: 'firstCol'
      },
      {
        title: '目的',
        dataIndex: 'dir',
        width: '25%',
        render: (text, record) => {
          return record.dir === 1 ? '归寝' : '出寝'
        }
      },
      {
        title: '打卡手机型号',
        dataIndex: 'model',
        width: '25%'
      },
      {
        title: '标记',
        dataIndex: 'status',
        width: '25%',
        render: (text, record, index) => {
          return record.status === 1 ? null : (
            <div>
              <ul>
                <li>
                  <a className="exceptionTipColor">异常</a>
                  <Button
                    className="cancelExceptionBtn"
                    type="primary"
                    onClick={event => {
                      this.fixUnExceptionButtonClicked(event, record, index)
                    }}
                  >
                    取消异常
                  </Button>
                </li>
              </ul>
            </div>
          )
        }
      }
    ]

    this.backDormColumns = [
      {
        title: '时间',
        dataIndex: 'time',
        className: 'firstCol'
      },
      {
        title: '归寝状态',
        dataIndex: 'status',
        width: '25%',
        render: (text, record) => {
          return DOORFORBID_RECORD_BACKDORM_STATUS[record.status + 1]
        }
      },
      {
        title: '操作',
        width: '25%',
        render: (text, record, index) => {
          return record.status === 1 ? null : (
            <Button
              className="leftBtn"
              type="primary"
              onClick={event => {
                this.fixUnExceptionButtonClicked(event, record, index)
              }}
            >
              改为已归寝
            </Button>
          )
        }
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
      this.closeButtonClick(null)
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

  unbindButtonClicked = e => {
    let { detail_unbindCount } = this.props

    let detail_recordInfo = JSON.parse(
      JSON.stringify(this.props.detail_recordInfo)
    )
    let { memberId } = detail_recordInfo
    const body = {}
    body.id = memberId

    const callBack = result => {
      if (result === true) {
        detail_recordInfo.bindStatus = 1
        detail_recordInfo.mobile = ''
        this.props.changeDoorForbid(subModule, {
          detail_unbindCount: detail_unbindCount + 1,
          detail_recordInfo: detail_recordInfo
        })
      }
    }
    fetchUnbindUserInDorm(body, callBack)
  }

  fixUnExceptionButtonClicked = (e, record, index) => {
    let detail_dataSource = JSON.parse(
      JSON.stringify(this.props.detail_dataSource)
    )
    let { detail_formType } = this.props

    const body = {}
    body.type = detail_formType
    if (detail_formType === 1) {
      body.checkLogId = record.id
    } else {
      body.memberId = record.memberId
    }

    body.day = record.day

    const callBack = result => {
      if (result === true) {
        detail_dataSource[index].status = 1
        this.props.changeDoorForbid(subModule, {
          detail_dataSource: detail_dataSource
        })
        this.forceRefresh(this.props)
      }
    }
    fetchChangeBackDormStatus(body, callBack)
  }
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
      // sex,
      grade,
      dormitory,
      schoolName,
      status,
      bindStatus
    } = detail_recordInfo

    return (
      <div
        className={
          detail_show ? 'backDormDetailWrapper' : 'backDormDetailWrapper hidden'
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

        <div className="backDormDetail-scrollContent">
          <div className="backDormDetail-content">
            <h3>{`${name || ''} ${schoolName || ''}`}</h3>
            <ul className="detaiList">
              <li>
                <label>手机号:</label>
                <span>{mobile}</span>
              </li>
              <li>
                <label>绑定状态:</label>
                <span>{bindStatus === 2 ? '已绑定' : '未绑定'}</span>
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
              {/* <li>
              <label>性别:</label>
              <span>{SEX[sex]}</span>
            </li> */}
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
                    status === 1
                      ? 'success'
                      : status === 2 ? 'warning' : 'error'
                  }
                  text={
                    status === 1 ? '已归寝' : status === 2 ? '晚归寝' : '未归寝'
                  }
                />
              </li>
            </ul>
            {bindStatus === 2 ? (
              <Popconfirm
                title="确定要解除绑定该用户吗?"
                onConfirm={this.unbindButtonClicked}
                okText="确认"
                cancelText="取消"
              >
                <Button className="unbindButton" type="primary">
                  解除绑定
                </Button>
              </Popconfirm>
            ) : null}
          </div>

          <div className="queryPanel">
            <div className="queryLine">
              <div className="block recordDetailTimeRange">
                <span>时间筛选:</span>
                <CheckSelect
                  options={DOORFORBID_RECORD_TIME}
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
                  options={DOORFORBID_FORM}
                  value={detail_formType}
                  onClick={this.changeformType}
                />
              </div>
            </div>
          </div>

          <Table
            className="backDormDetail-tableList"
            loading={detail_loading}
            bordered
            rowKey={(record, index) => record.id || index}
            pagination={{
              pageSize: SIZE,
              current: detail_page,
              total: detail_total
            }}
            dataSource={detail_dataSource}
            columns={
              detail_formType === 1 ? this.signInColumns : this.backDormColumns
            }
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
  detail_recordInfo: state.doorForbidModule[subModule].detail_recordInfo,
  detail_unbindCount: state.doorForbidModule[subModule].detail_unbindCount
})

export default withRouter(
  connect(mapStateToProps, {
    changeDoorForbid,
    fetchDetailRecordList
  })(BackDormRecordDetail)
)
