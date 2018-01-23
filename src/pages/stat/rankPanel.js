import React, { Component } from 'react'
import { Table, DatePicker } from 'antd'
import AjaxHandler from '../ajax'
import Time from '../component/time'
import Noti from '../noti'
import moment from 'moment'
import { getLocal } from '../util/storage'
import SchoolSelector from '../component/schoolSelector'

import { checkObject } from '../util/checkSame'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeStat, setSchoolList } from '../../actions'
const subModule = 'rank'
const { RangePicker } = DatePicker

const NOW = Date.parse(new Date())
/*----------timespan: 1-今日,2-本周,3-本月-----*/

const CLASSNAMES = [
  {
    1: 'on',
    2: 'neighbor',
    3: ''
  },
  {
    1: 'neighbor',
    2: 'on',
    3: ''
  },
  {
    1: '',
    2: 'neighbor',
    3: 'on'
  }
]
const TITLES = [
  '所有学校订单总收益',
  '所有学校新增用户总数',
  '所有学校使用红包总个数',
  '所有学校净收益',
  '所有学校报修设备总数'
]
const TITLES2 = ['', '', '所有学校使用红包总金额', '']
const RANK = ['order', 'user', 'bonus', 'funds', 'repair']
const TOTALNAME = [
  'totalIncome',
  'totalNewly',
  'totalAmount',
  'pureIncome',
  'totalAmount'
]
const TOTAL2NAME = ['', '', 'totalMoney', '', '']
const SIZE = 2

const orderColumns = [
  {
    title: '排名',
    width: '12%',
    dataIndex: 'ranking',
    className: 'firstCol'
  },
  {
    title: '学校名称',
    dataIndex: 'schoolName'
  },
  {
    title: <p className="center">热水器订单</p>,
    dataIndex: 'showerAmount',
    width: '12%',
    className: 'center'
  },
  {
    title: <p className="center">饮水机订单</p>,
    dataIndex: 'waterAmount',
    width: '12%',
    className: 'center'
  },
  {
    title: <p className="center">总订单</p>,
    dataIndex: 'totalAmount',
    width: '12%',
    className: 'center'
  },
  {
    title: <p className="center">热水器收益</p>,
    dataIndex: 'showerIncome',
    width: '12%',
    className: 'center'
  },
  {
    title: <p className="center">饮水机收益</p>,
    dataIndex: 'waterIncome',
    width: '12%',
    className: 'center'
  },
  {
    title: <p className="center">总收益</p>,
    dataIndex: 'totalIncome',
    width: '12%',
    className: 'center'
  }
]

const userColumns = [
  {
    title: '排名',
    width: '12%',
    dataIndex: 'ranking',
    className: 'firstCol'
  },
  {
    title: '学校名称',
    dataIndex: 'schoolName'
  },
  {
    title: <p className="center">总用户</p>,
    dataIndex: 'total',
    width: '25%',
    className: 'center'
  },
  {
    title: <p className="center">新增用户</p>,
    dataIndex: 'newly',
    width: '25%',
    className: 'center'
  }
]

const bonusColumns = [
  {
    title: '排名',
    width: '12%',
    dataIndex: 'ranking',
    className: 'firstCol'
  },
  {
    title: '学校名称',
    dataIndex: 'schoolName'
  },
  {
    title: <p className="center">领取红包</p>,
    dataIndex: 'receiveAmount',
    width: '15%',
    className: 'center'
  },
  {
    title: <p className="center">使用红包</p>,
    dataIndex: 'useAmount',
    width: '15%',
    className: 'center'
  },
  {
    title: <p className="center">领取红包总金额</p>,
    dataIndex: 'receiveMoney',
    width: '18%',
    className: 'center'
  },
  {
    title: <p className="center">使用红包总金额</p>,
    dataIndex: 'useMoney',
    width: '18%',
    className: 'center'
  }
]
const fundsColumns = [
  {
    title: '排名',
    width: '12%',
    dataIndex: 'ranking',
    className: 'firstCol'
  },
  {
    title: '学校名称',
    dataIndex: 'schoolName'
  },
  {
    title: <p className="center">充值订单</p>,
    dataIndex: 'rechargeAmount',
    width: ',12%',
    className: 'center'
  },
  {
    title: <p className="center">提现订单</p>,
    dataIndex: 'withdrawAmount',
    width: ',12%',
    className: 'center'
  },
  {
    title: <p className="center">总订单</p>,
    dataIndex: 'totalAmount',
    width: ',12%',
    className: 'center'
  },
  {
    title: <p className="center">充值金额</p>,
    dataIndex: 'rechargeMoney',
    width: ',12%',
    className: 'center'
  },
  {
    title: <p className="center">提现金额</p>,
    dataIndex: 'withdrawMoney',
    width: ',12%',
    className: 'center'
  },
  {
    title: <p className="center">净收益</p>,
    dataIndex: 'totalMoney',
    width: ',12%',
    className: 'center'
  }
]
const repairColumns = [
  {
    title: '排名',
    width: '12%',
    dataIndex: 'ranking',
    className: 'firstCol'
  },
  {
    title: '学校名称',
    dataIndex: 'schoolName'
  },
  {
    title: <p className="center">热水器报修</p>,
    dataIndex: 'shower',
    width: '22%',
    className: 'center'
  },
  {
    title: <p className="center">饮水机报修</p>,
    dataIndex: 'water',
    width: '22%',
    className: 'center'
  },
  {
    title: <p className="center">总数</p>,
    dataIndex: 'total',
    width: '20%',
    className: 'center'
  }
]

const initilaState = {
  startTime: Time.getTodayStart(NOW),
  endTime: Time.getNow(),
  dataSource: [],
  searchingText: '',
  titleValue: 0,
  titleValue2: 0,
  loading: false,
  total: 0
}
const COLUMNS = [
  orderColumns,
  userColumns,
  bonusColumns,
  fundsColumns,
  repairColumns
]

class RankPanel extends Component {
  static propTypes = {
    schoolId: PropTypes.string.isRequired,
    timeSpan: PropTypes.number.isRequired,
    currentRank: PropTypes.number.isRequired,
    page: PropTypes.number.isRequired,
    schools: PropTypes.array.isRequired,
    schoolSet: PropTypes.bool.isRequired
  }

  state = initilaState

  fetchData = (body, index) => {
    this.setState({
      loading: true
    })
    let rank = index
    let resource = `/statistics/${RANK[rank]}/rank`
    const cb = json => {
      let nextState = { loading: false }
      if (json.error) {
        Noti.hintServiceError(json.error.displayMessage)
      } else {
        let start = (body.page - 1) * SIZE
        json.data.rows &&
          json.data.rows.forEach((r, i) => {
            r.ranking = start + i + 1
          })
        nextState.dataSource = json.data.rows
        nextState.total = json.data.total
        nextState.titleValue = json.data[TOTALNAME[rank]]
        nextState.titleValue2 = TOTAL2NAME[rank]
          ? json.data[TOTAL2NAME[rank]]
          : ''
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb)
  }

  fetchSchools = () => {
    console.log('fetch')
    let resource = '/school/list'
    const body = {
      page: 1,
      size: 100
    }
    const cb = json => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        if (json.data) {
          let recentSchools = getLocal('recentSchools'),
            recent = []
          if (recentSchools) {
            recent = recentSchools.split(',').filter(r => {
              return json.data.schools.some(s => s.id === parseInt(r, 10))
            })
          }
          this.props.setSchoolList({
            schoolSet: true,
            recent: recent,
            schools: json.data.schools
          })
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }

  componentDidMount() {
    let {
      schoolId,
      schools,
      schoolSet,
      page,
      timeSpan,
      currentRank
    } = this.props
    const body = {
      endTime: Time.getNow(),
      page: page,
      size: SIZE
    }
    if (schoolId !== 'all') {
      if (!schoolSet) {
        this.fetchSchools()
        return
      }
      let school = schools.find(r => r.id === parseInt(schoolId, 10))
      if (school && school.name) {
        body.schoolName = school.name
      }
    }
    let newStartTime
    if (timeSpan === 1) {
      //today
      newStartTime = Time.getTodayStart(NOW)
    } else if (timeSpan === 2) {
      newStartTime = Time.getWeekStart(NOW)
    } else {
      newStartTime = Time.getMonthStart(NOW)
    }
    body.startTime = newStartTime
    this.fetchData(body, currentRank)
  }

  componentWillReceiveProps(nextProps) {
    if (
      checkObject(this.props, nextProps, [
        'page',
        'schoolId',
        'timespan',
        'currentRank',
        'startTime',
        'endTime'
      ])
    ) {
      return
    }
    let {
      schoolId,
      schools,
      schoolSet,
      page,
      timeSpan,
      currentRank,
      startTime,
      endTime
    } = nextProps
    if (
      checkObject(this.props, nextProps, [
        'schoolId',
        'schoolSet',
        'page',
        'timeSpan',
        'currentRank',
        'startTime',
        'endTime'
      ])
    ) {
      return
    }
    const body = {
      endTime: Time.getNow(),
      page: page,
      size: SIZE
    }
    if (schoolId !== 'all') {
      if (!schoolSet) {
        this.fetchSchools()
        return
      }
      let school = schools.find(r => r.id === parseInt(schoolId, 10))
      if (school && school.name) {
        body.schoolName = school.name
      }
    }
    let newStartTime
    if (startTime) {
      console.log(startTime, endTime)

      body.startTime = startTime
      body.endTime = endTime
    } else {
      if (timeSpan === 1) {
        //today
        newStartTime = Time.getTodayStart(NOW)
      } else if (timeSpan === 2) {
        newStartTime = Time.getWeekStart(NOW)
      } else {
        newStartTime = Time.getMonthStart(NOW)
      }
      body.startTime = newStartTime
    }
    this.fetchData(body, currentRank)
  }

  changeTimeSpan = e => {
    let i = e.target.getAttribute('data-value')
    let v = parseInt(i, 10)
    if (v === this.props.timeSpan) {
      return
    }
    this.props.changeStat(subModule, {
      timeSpan: v,
      startTime: '',
      endTime: ''
    })
  }

  chooseChart = e => {
    let i = parseInt(e.target.getAttribute('data-index'), 10)

    let { currentRank } = this.props
    if (i === currentRank) {
      return
    }
    this.props.changeStat(subModule, { currentRank: i, page: 1 })
  }

  changeSchool = (v, name) => {
    let { schoolId } = this.props
    if (schoolId !== v) {
      this.props.changeStat(subModule, {
        schoolId: v,
        schoolName: name,
        page: 1
      })
    }
  }
  changePage = pageObj => {
    let { page } = this.props
    if (page === pageObj.current) {
      return
    }
    this.props.changeStat(subModule, { page: pageObj.current })
  }
  selectRange = (dates, dateStrings) => {
    let newStartTime = Time.getDayStart(dateStrings[0]),
      newEndTime = Time.getDayEnd(dateStrings[1])
    this.props.changeStat(subModule, {
      startTime: newStartTime,
      endTime: newEndTime,
      page: 1,
      timeSpan: 0
    })
  }

  render() {
    const { dataSource, titleValue, titleValue2, loading, total } = this.state
    const {
      schoolId,
      timeSpan,
      currentRank,
      page,
      startTime,
      endTime
    } = this.props

    return (
      <div className="ranksWrapper">
        <section className="selectBar">
          <h3>排行榜</h3>

          <div className="selectBox">
            <SchoolSelector
              selectedSchool={schoolId}
              changeSchool={this.changeSchool}
            />
          </div>

          <div className="timespan">
            <a
              data-value={1}
              ref="tp1"
              className={CLASSNAMES[0][timeSpan]}
              onClick={this.changeTimeSpan}
            >
              本日
            </a>
            <a
              data-value={2}
              ref="tp2"
              className={CLASSNAMES[1][timeSpan]}
              onClick={this.changeTimeSpan}
            >
              本周
            </a>
            <a
              data-value={3}
              ref="tp3"
              className={CLASSNAMES[2][timeSpan]}
              onClick={this.changeTimeSpan}
            >
              本月
            </a>
          </div>
          <RangePicker
            allowClear={false}
            className="rangePicker mgl10"
            value={
              startTime
                ? [
                    startTime ? moment(Time.getDayFormat(startTime)) : '',
                    endTime ? moment(Time.getDayFormat(endTime)) : ''
                  ]
                : ''
            }
            onChange={this.selectRange}
          />
        </section>

        <ul className="chartSelector" onClick={this.chooseChart}>
          <li data-index={0} className={currentRank === 0 ? 'active' : ''}>
            订单排行榜
            {currentRank === 0 ? <div className="bdbtm" /> : null}
          </li>
          <li data-index={1} className={currentRank === 1 ? 'active' : ''}>
            用户排行榜
            {currentRank === 1 ? <div className="bdbtm" /> : null}
          </li>
          <li data-index={2} className={currentRank === 2 ? 'active' : ''}>
            红包使用排行榜
            {currentRank === 2 ? <div className="bdbtm" /> : null}
          </li>
          <li data-index={3} className={currentRank === 3 ? 'active' : ''}>
            资金排行榜
            {currentRank === 3 ? <div className="bdbtm" /> : null}
          </li>
          <li data-index={4} className={currentRank === 4 ? 'active' : ''}>
            设备报修排行榜
            {currentRank === 4 ? <div className="bdbtm" /> : null}
          </li>
        </ul>

        <h3 className="tableTitle">
          {TITLES[currentRank]}:{titleValue}
          {TITLES2[currentRank] ? (
            <span>
              {TITLES2[currentRank]}:{titleValue2}
            </span>
          ) : null}
        </h3>

        <div className="table">
          <Table
            bordered
            loading={loading}
            rowKey={(record, index) => index}
            pagination={{ pageSize: SIZE, total: total, current: page }}
            dataSource={dataSource}
            columns={COLUMNS[currentRank]}
            onChange={this.changePage}
          />
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    schoolId: state.changeStat[subModule].schoolId,
    timeSpan: state.changeStat[subModule].timeSpan,
    page: state.changeStat[subModule].page,
    currentRank: state.changeStat[subModule].currentRank,
    startTime: state.changeStat[subModule].startTime,
    endTime: state.changeStat[subModule].endTime,
    schools: state.setSchoolList.schools,
    schoolSet: state.setSchoolList.schoolSet
  }
}

export default withRouter(
  connect(mapStateToProps, {
    changeStat,
    setSchoolList
  })(RankPanel)
)
