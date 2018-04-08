import React, { Component } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area
} from 'recharts'
import SchoolSelector from '../component/schoolSelector'
import { DatePicker, Switch } from 'antd'
import AjaxHandler from '../../util/ajax'
import Format from '../../util/format'
import CONSTANTS from '../../constants'
import Time from '../../util/time'
import Noti from '../../util/noti'
import moment from 'moment'
import { div } from '../../util/numberHandle'
import { checkObject } from '../../util/checkSame'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeStat, setSchoolList } from '../../actions'
const subModule = 'charts'

const { MonthPicker, RangePicker } = DatePicker

const NOW = Date.parse(new Date())

const DAY = {
  1: '本日',
  2: '本周',
  3: '本月'
}
const LASTDAY = {
  1: '昨日',
  2: '上周',
  3: '上月'
}
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
const CHARTTYPES = CONSTANTS.CHARTTYPES
const data1Name = {
  1: 'showerPoints',
  2: 'newlyPoints',
  3: 'receivePoints',
  4: 'rechargePoints',
  5: 'showerPoints'
}
const data2Name = {
  1: 'waterPoints',
  3: 'usePoints',
  4: 'withdrawPoints',
  5: 'waterPoints'
}
const data1label = {
  1: '订单数量',
  2: '',
  3: '红包数量',
  4: '订单数量',
  5: ''
}
const data2label = {
  1: '订单收益',
  3: '红包金额',
  4: '订单收益'
}
const LEGEND = {
  order: {
    1: ['热水器订单', '饮水机订单'],
    2: ['热水器收益', '饮水机收益']
  },
  user: {
    1: ['新增用户']
  },
  bonus: {
    1: ['领取数量', '使用数量'],
    2: ['领取金额', '使用金额']
  },
  funds: {
    1: ['充值订单', '提现订单'],
    2: ['充值收益', '提现收益']
  },
  repair: {
    1: ['热水器报修', '饮水机报修']
  }
}
const AREATIMEUNIT = 3
const CURMONTHSTR = Time.getMonthFormat(NOW)
/*----------timeUnit:1-hour,2-day------------*/
/*----------target: 切换图表内的分支-----------*/
/*----------timespan: 1-今日，2-本周,3-本月-----*/
/*----------compare: 对比flag-----------------*/

const initilaState = {
  data: [],
  loading: false,
  schoolId: 'all',
  target: 1,
  timeUnit: 2,
  startTime: Time.getWeekStart(NOW),
  endTime: Time.getWeekEnd(NOW),
  compare: false,
  timeSpan: 2,
  currentChart: 1,
  currentMonth: true,
  monthStr: '',
  areaData: [],
  areaStartTime: Time.getFirstWeekStart(Time.getMonthStart(NOW))
}

class Charts extends Component {
  static propTypes = {
    schoolId: PropTypes.string.isRequired,
    timeSpan: PropTypes.number.isRequired,
    currentChart: PropTypes.number.isRequired,
    target: PropTypes.number.isRequired,
    compare: PropTypes.bool.isRequired,
    currentMonth: PropTypes.bool.isRequired,
    monthStr: PropTypes.string.isRequired,
    schools: PropTypes.array.isRequired,
    schoolSet: PropTypes.bool.isRequired
  }

  state = initilaState

  fetchData = (body, newState) => {
    this.setState({
      loading: true
    })
    /* in case: 1. change chart index, 2. change target. 
    ** The state won't change immediately when fetchDate, so need to pass newState through parameters 
    */
    let { currentChart, target, startTime, endTime, timeUnit, compare } = {
      ...body,
      ...newState
    }
    let resource = `/statistics/${CHARTTYPES[currentChart]}/polyline`
    const cb = json => {
      let nextState = {
        loading: false
      }
      if (json.error) {
        Noti.hintServiceError(json.error.displayMessage)
      } else {
        let firstPoints = json.data[data1Name[currentChart]],
          secondPoints = json.data[data2Name[currentChart]] || null
        /* change the denomination when the result is about money */
        if (target === 2) {
          if (currentChart === 1 || currentChart === 3 || currentChart === 4) {
            firstPoints.forEach((f, i, arr) => {
              let v = f.y ? div(f.y, 100) : 0
              arr[i].y = parseInt(v, 10)
            })
            secondPoints.forEach((s, i, arr) => {
              let v = div(s.y, 100)
              arr[i].y = parseInt(v, 10)
            })
          }
        }
        let data
        if (timeUnit === 2) {
          data = Time.getDateArray(startTime, endTime)
          data.forEach((r, i) => {
            let t = Date.parse(new Date(r.x))
            if (t < NOW) {
              r.y = 0
              r.y2 = 0
            }
          })
          firstPoints &&
            firstPoints.forEach((r, i) => {
              let x = Format.dayFormat(r.x)
              let xInData = data.find((r, i) => r.x === x)
              if (xInData) {
                xInData.y = r.y //push first array data into data array
              }
            })
          secondPoints &&
            secondPoints.forEach((r, i) => {
              let x = Format.dayFormat(r.x)
              let xInData = data.find((r, i) => r.x === x)
              if (xInData) {
                xInData.y2 = r.y //push second array data into data array
              }
            })
        } else {
          data = Time.getHourArray(startTime, endTime)
          data.forEach((r, i) => {
            let t = Date.parse(new Date(r.x))
            if (t < NOW) {
              r.y = 0
              r.y2 = 0
            }
          })
          firstPoints &&
            firstPoints.forEach((r, i) => {
              let x = Format.hourFormat(r.x)
              let xInData = data.find((r, i) => r.x === x)
              if (xInData) {
                xInData.y = r.y //push shower points into data array
              }
            })
          secondPoints &&
            secondPoints.forEach((r, i) => {
              let x = Format.hourFormat(r.x)
              let xInData = data.find((r, i) => r.x === x)
              if (xInData) {
                xInData.y2 = r.y //push shower points into data array
              }
            })
        }
        nextState.data = data
      }
      if (compare) {
        this.fetchCompareData()
        nextState.loading = true
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb)
  }

  fetchAreaData = body => {
    let resource = '/api/statistics/repair/time/polyline'
    const cb = json => {
      let nextState = {
        loading: false
      }
      if (json.error) {
        throw new Error(json.error)
      } else {
        let { acceptTime, assignTime, repairTime } = json.data,
          data = []
        let { startTime } = body
        //starttime是第一个周一的0点，用它减去该年第一天0点，除以7*24*3600*1000，就得到了中间有多少周

        let startWeekNum = Time.getFirstWeekNum(startTime)
        for (let i = 0; i < 4; i++) {
          let monday = startTime + i * 7 * 24 * 3600 * 1000
          let item = {
            x: `第${i + 1}周`,
            num: startWeekNum + i
          }
          //如果周一的0点已经过去，就将所有的值置为0
          if (monday < NOW) {
            item.assign = 0
            item.repair = 0
            item.y = 0
          }
          data.push(item)
        }
        acceptTime &&
          acceptTime.forEach((r, i) => {
            let item = data.find(
              (record, ind) => record.num === Format.getWeekNum(r.x)
            )
            if (item) {
              item.y = r.y
            }
          })
        assignTime &&
          assignTime.forEach((r, i) => {
            let item = data.find(
              (record, ind) => record.num === Format.getWeekNum(r.x)
            )
            if (item) {
              item.assign = r.y
            }
          })
        repairTime &&
          repairTime.forEach((r, i) => {
            let item = data.find(
              (record, ind) => record.num === Format.getWeekNum(r.x)
            )
            if (item) {
              item.repair = r.y
            }
          })
        nextState.areaData = data
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb)
  }

  componentDidMount() {
    let {
      schoolId,
      target,
      timeSpan,
      currentChart,
      currentMonth,
      monthStr,
      compare
    } = this.props

    /* if click repair/time chart, fetch the repair/time areaData */
    if (currentChart === 6) {
      if (currentMonth) {
        let areaStartTime = Time.getFirstWeekStart(Time.getMonthStart(NOW))
        let areaEndTime = Time.getTheLastWeekEnd(Time.getMonthEnd(NOW))
        const body = {
          endTime: areaEndTime,
          startTime: areaStartTime,
          timeUnit: AREATIMEUNIT
        }
        if (schoolId !== 'all') {
          body.schoolId = parseInt(schoolId, 10)
        }
        this.fetchAreaData(body)
      } else {
        let newStartTime = Time.getFirstWeekStart(
            Time.getMonthStart(monthStr + '-1')
          ),
          newEndTime = Time.getTheLastWeekEnd(Time.getMonthEnd(monthStr + '-1'))
        const body = {
          timeUnit: AREATIMEUNIT,
          startTime: newStartTime,
          endTime: newEndTime
        }
        if (schoolId !== 'all') {
          body.schoolId = parseInt(schoolId, 10)
        }
        this.fetchAreaData(body)
      }
      return
    }

    /* else fetch the line data */
    let timeUnit = 2
    let newStartTime,
      newEndTime,
      body = {}

    if (timeSpan === 1) {
      //today
      newStartTime = Time.getDayStart(NOW)
      newEndTime = Time.getDayEnd(NOW)
      timeUnit = 1
    } else if (timeSpan === 2) {
      newStartTime = Time.getWeekStart(NOW)
      newEndTime = Time.getWeekEnd(NOW)
    } else {
      newStartTime = Time.getMonthStart(NOW)
      newEndTime = Time.getMonthEnd(NOW)
    }

    body.startTime = newStartTime
    body.endTime = newEndTime
    body.timeUnit = timeUnit
    body.target = target

    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    this.fetchData(body, { currentChart: currentChart, compare: compare })
  }

  componentWillReceiveProps(nextProps) {
    if (
      checkObject(this.props, nextProps, [
        'target',
        'schoolId',
        'timespan',
        'currentChart',
        'currentMonth',
        'monthStr',
        'compare',
        'startTime',
        'endTime'
      ])
    ) {
      return
    }
    let {
      schoolId,
      target,
      timeSpan,
      currentChart,
      currentMonth,
      monthStr,
      compare,
      startTime,
      endTime
    } = nextProps

    /* if click repair/time chart, fetch the repair/time areaData */
    if (currentChart === 6) {
      if (currentMonth) {
        let areaStartTime = Time.getFirstWeekStart(Time.getMonthStart(NOW))
        let areaEndTime = Time.getTheLastWeekEnd(Time.getMonthEnd(NOW))
        const body = {
          endTime: areaEndTime,
          startTime: areaStartTime,
          timeUnit: AREATIMEUNIT
        }
        if (schoolId !== 'all') {
          body.schoolId = parseInt(schoolId, 10)
        }
        this.fetchAreaData(body)
      } else {
        let newStartTime = Time.getFirstWeekStart(
            Time.getMonthStart(monthStr + '-1')
          ),
          newEndTime = Time.getTheLastWeekEnd(Time.getMonthEnd(monthStr + '-1'))
        const body = {
          timeUnit: AREATIMEUNIT,
          startTime: newStartTime,
          endTime: newEndTime
        }
        if (schoolId !== 'all') {
          body.schoolId = parseInt(schoolId, 10)
        }
        this.fetchAreaData(body)
      }
      return
    }

    /* if remove compare, only remove compare data */
    if (this.props.compare === true && compare === false) {
      this.removeCompareData()
    }

    /* else fetch the line data */
    let timeUnit = 2
    let newStartTime,
      newEndTime,
      body = { target: target }

    if (startTime) {
      body.startTime = startTime
      body.endTime = endTime
      body.timeUnit = timeUnit
    } else {
      if (timeSpan === 1) {
        //today
        newStartTime = Time.getDayStart(NOW)
        newEndTime = Time.getDayEnd(NOW)
        timeUnit = 1
      } else if (timeSpan === 2) {
        newStartTime = Time.getWeekStart(NOW)
        newEndTime = Time.getWeekEnd(NOW)
      } else {
        newStartTime = Time.getMonthStart(NOW)
        newEndTime = Time.getMonthEnd(NOW)
      }

      body.startTime = newStartTime
      body.endTime = newEndTime
      body.timeUnit = timeUnit
    }

    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    this.fetchData(body, { currentChart: currentChart, compare: compare })
  }

  changeTarget = e => {
    e.preventDefault()
    let v = parseInt(e.target.getAttribute('data-value'), 10)
    let { target } = this.props
    if (v === target) {
      return
    }
    this.props.changeStat(subModule, { target: v })
  }

  fetchCompareData = () => {
    this.setState({
      loading: true
    })
    let { schoolId, target, timeSpan, currentChart } = this.props

    let timeUnit = 2

    let newStartTime,
      newEndTime /*----------------------------------------------*/
    if (timeSpan === 1) {
      newStartTime = Time.getYestodayStart()
      newEndTime = Time.getYestodayEnd()
      timeUnit = 1
    } else if (timeSpan === 2) {
      newStartTime = Time.getLastWeekStart()
      newEndTime = Time.getLastWeekEnd()
    } else if (timeSpan === 3) {
      newStartTime = Time.getLastMonthStart()
      newEndTime = Time.getLastMonthEnd()
    } else {
      return Noti.hintLock(
        '当前状态下不能比较！',
        '请选择本日/本周/本月后再进行比较'
      )
    }
    let resource = `/statistics/${CHARTTYPES[currentChart]}/polyline`
    const body = {
      startTime: newStartTime,
      endTime: newEndTime,
      target: target,
      timeUnit: timeUnit
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    const cb = json => {
      let nextState = {
        loading: false
      }
      if (json.error) {
        throw new Error(json.error)
      } else {
        let firstPoints = json.data[data1Name[currentChart]],
          secondPoints =
            data2Name[currentChart] && json.data[data2Name[currentChart]]
        if (target === 2) {
          if (currentChart === 1 || currentChart === 3 || currentChart === 4) {
            firstPoints.forEach((f, i, arr) => {
              let v = div(f.y, 100)
              arr[i].y = parseInt(v, 10)
            })
            secondPoints.forEach((s, i, arr) => {
              let v = div(s.y, 100)
              arr[i].y = parseInt(v, 10)
            })
          }
        }

        let newData = JSON.parse(JSON.stringify(this.state.data))

        //将过去的数据转为本日/周/月的数据，再将其插入data数组中
        if (timeSpan === 1) {
          newData.forEach((r, i) => {
            r.lasty = 0
            r.lasty2 = 0
            let lastX = Time.ago24Hour(r.x) //取得24小时之前的时间
            r.lastX = lastX
          })
          firstPoints &&
            firstPoints.forEach((r, i) => {
              let item = newData.find(
                (record, ind) => Format.hourFormat(r.x) === record.lastX
              )
              if (item) {
                item.lasty = r.y
              }
            })
          secondPoints &&
            secondPoints.forEach((r, i) => {
              let item = newData.find(
                (record, ind) => Format.hourFormat(r.x) === record.lastX
              )
              if (item) {
                item.lasty2 = r.y
              }
            })
        } else if (timeSpan === 2) {
          newData.forEach((r, i) => {
            r.lasty = 0
            r.lasty2 = 0
            let lastX = Time.weekAgo(r.x) //取得24小时之前的时间
            r.lastX = lastX
          })
          firstPoints &&
            firstPoints.forEach((r, i) => {
              let item = newData.find(
                (record, ind) => record.lastX === Format.dayFormat(r.x)
              )
              if (item) {
                item.lasty = r.y
              }
            })
          secondPoints &&
            secondPoints.forEach((r, i) => {
              let item = newData.find(
                (record, ind) => record.lastX === Format.dayFormat(r.x)
              )
              if (item) {
                item.lasty2 = r.y
              }
            })
        } else {
          let lastMonthArray = Time.getDateArray(
            Time.getLastMonthStart(),
            Time.getLastMonthEnd()
          )
          lastMonthArray.forEach((r, i) => {
            if (i < newData.length) {
              newData[i].lasty = 0
              newData[i].lasty2 = 0
              newData[i].lastX = r.x
            } else {
              newData.push({
                lastX: r.x,
                lasty: 0,
                lasty2: 0
              })
            }
          })
          firstPoints &&
            firstPoints.forEach((r, i) => {
              let item = newData.find(
                (record, ind) => record.lastX === Format.dayFormat(r.x)
              )
              if (item) {
                item.lasty = r.y
              }
            })
          secondPoints &&
            secondPoints.forEach((r, i) => {
              let item = newData.find(
                (record, ind) => record.lastX === Format.dayFormat(r.x)
              )
              if (item) {
                item.lasty2 = r.y
              }
            })
        }
        nextState.data = newData
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb)
  }

  removeCompareData = () => {
    /*-----------后续查看是否需要重新拉取数据，因为可能比较两月时，当前月的数据比上月少，删除上月后当前数据中有无效长度，重新拉取会呈现地更好-------------*/
    let { data } = this.state,
      newData = JSON.parse(JSON.stringify(data))
    newData &&
      newData.forEach((r, i) => {
        delete r.lasty
        delete r.lasty2
      })
    this.setState({
      data: newData
    })
  }

  chooseChart = e => {
    let i = parseInt(e.target.getAttribute('data-index'), 10)
    let { currentChart } = this.props
    if (i === currentChart) {
      return
    }
    this.props.changeStat(subModule, { currentChart: i, target: 1 })
  }
  changeCurrent = e => {
    e.preventDefault()
    let { currentMonth } = this.props
    if (currentMonth) {
      return
    }
    this.props.changeStat(subModule, {
      currentMonth: true,
      monthStr: CURMONTHSTR
    })
  }
  selectRange = (date, dateString) => {
    let { monthStr } = this.props,
      currentMonth = true
    if (dateString === monthStr) {
      return
    }
    if (dateString !== CURMONTHSTR) {
      currentMonth = false
    }
    this.props.changeStat(subModule, {
      monthStr: dateString,
      currentMonth: currentMonth
    })
  }
  changeSchool = v => {
    let { schoolId } = this.props
    if (schoolId === v) {
      return
    }
    this.props.changeStat(subModule, { schoolId: v })
  }
  changeTimeSpan = e => {
    /*-----------if compared,clean it-----------*/
    e.preventDefault()
    let v = parseInt(e.target.getAttribute('data-value'), 10)
    let { timeSpan } = this.props
    if (timeSpan === v) {
      return
    }
    this.props.changeStat(subModule, {
      timeSpan: v,
      startTime: '',
      endTime: ''
    })
  }

  compareLast = checked => {
    let { compare, timeSpan } = this.props
    if (compare === checked) {
      return
    }
    // timeSpan === 0 means select a timeRange, can't compare.
    if (timeSpan === 0) {
      return Noti.hintLock(
        '当前状态下不能比较！',
        '请选择本日/本周/本月后再进行比较'
      )
    }
    this.props.changeStat(subModule, { compare: checked })
  }

  selectDayRange = (dates, dateStrings) => {
    let newStartTime = Time.getDayStart(dateStrings[0]),
      newEndTime = Time.getDayEnd(dateStrings[1])
    this.props.changeStat(subModule, {
      startTime: newStartTime,
      endTime: newEndTime,
      timeSpan: 0,
      compare: false
    })
  }

  render() {
    const { data, timeUnit, areaData, loading } = this.state
    const {
      schoolId,
      target,
      currentChart,
      timeSpan,
      compare,
      currentMonth,
      monthStr,
      startTime,
      endTime
    } = this.props

    return (
      <div className="chart">
        {loading ? <div className="loadingMask" /> : null}
        <div className="selectBar">
          <h3>统计图表</h3>

          <div className="selectBox">
            <SchoolSelector
              selectedSchool={schoolId}
              changeSchool={this.changeSchool}
            />
          </div>

          {currentChart !== 6 ? (
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
          ) : null}
          {currentChart !== 6 ? (
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
              onChange={this.selectDayRange}
            />
          ) : null}

          {currentChart !== 6 ? (
            <div className="selCompare">
              <span className="compare">对比{LASTDAY[timeSpan]}</span>
              <Switch
                checked={compare}
                size="small"
                onChange={this.compareLast}
              />
            </div>
          ) : null}

          {currentChart === 6 ? (
            <div className="areaQuery">
              <a
                className={currentMonth ? 'on padR' : 'padR'}
                onClick={this.changeCurrent}
              >
                本月
              </a>
              <MonthPicker
                allowClear={false}
                value={moment(monthStr)}
                className="rangePicker"
                onChange={this.selectRange}
              />
            </div>
          ) : null}
        </div>

        <ul className="chartSelector" onClick={this.chooseChart}>
          <li data-index={1} className={currentChart === 1 ? 'active' : ''}>
            订单统计
            {currentChart === 1 ? <div className="bdbtm" /> : null}
          </li>
          <li data-index={2} className={currentChart === 2 ? 'active' : ''}>
            用户统计
            {currentChart === 2 ? <div className="bdbtm" /> : null}
          </li>
          <li data-index={3} className={currentChart === 3 ? 'active' : ''}>
            红包使用统计
            {currentChart === 3 ? <div className="bdbtm" /> : null}
          </li>
          <li data-index={4} className={currentChart === 4 ? 'active' : ''}>
            资金统计
            {currentChart === 4 ? <div className="bdbtm" /> : null}
          </li>
          <li data-index={5} className={currentChart === 5 ? 'active' : ''}>
            设备报修统计
            {currentChart === 5 ? <div className="bdbtm" /> : null}
          </li>
          <li data-index={6} className={currentChart === 6 ? 'active' : ''}>
            设备报修处理时间统计
            {currentChart === 6 ? <div className="bdbtm" /> : null}
          </li>
        </ul>

        <div>
          {currentChart !== 6 ? (
            <div>
              <div className="query">
                <div>
                  <a
                    data-value={1}
                    className={target === 1 ? 'padLR on' : 'padLR'}
                    onClick={this.changeTarget}
                  >
                    {data1label[currentChart]}
                  </a>
                  {data2Name[currentChart] ? (
                    <a
                      data-value={2}
                      className={target === 2 ? 'on' : ''}
                      onClick={this.changeTarget}
                    >
                      {data2label[currentChart]}
                    </a>
                  ) : null}
                </div>
              </div>
              <div className="lineChartWrapper">
                <LineChart
                  width={CONSTANTS.CHARTWIDTH}
                  height={CONSTANTS.CHARTHEIGHT}
                  data={data}
                  margin={{ top: 10, right: 20, bottom: 0, left: 40 }}
                >
                  <CartesianGrid vertical={false} horizontal={false} />
                  <XAxis
                    padding={{ left: 20 }}
                    axisLine={{ stroke: '#ddd' }}
                    name="date"
                    dataKey="x"
                    tick={<CustomizedXAxisTick timeUnit={timeUnit} />}
                    tickLine={false}
                  />
                  <YAxis
                    axisLine={{ stroke: '#ddd' }}
                    domain={[0, 'dataMax']}
                    tickLine={false}
                    tick={<CustomizedAxisTick />}
                  />
                  <Tooltip
                    isAnimationActive={false}
                    cursor={{ stroke: '#222', strokeWidth: 1 }}
                    content={<CustomizedTooltip timeUnit={timeUnit} />}
                  />
                  <Legend
                    align="left"
                    verticalAlign="top"
                    iconType="line"
                    margin={{ left: -20 }}
                    wrapperStyle={{ paddingLeft: 20, top: -15 }}
                    width={300}
                    height={36}
                  />
                  <Line
                    name={
                      compare
                        ? `${DAY[timeSpan]}${
                            LEGEND[CHARTTYPES[currentChart]][target][0]
                          }`
                        : `${LEGEND[CHARTTYPES[currentChart]][target][0]}`
                    }
                    dataKey="y"
                    label="饮水机"
                    stroke="#4aaaef"
                    dot={false}
                    activeDot={{ strokeWidth: 2 }}
                  />
                  {data2Name[currentChart] ? (
                    <Line
                      name={
                        compare
                          ? `${DAY[timeSpan]}${
                              LEGEND[CHARTTYPES[currentChart]][target][1]
                            }`
                          : `${LEGEND[CHARTTYPES[currentChart]][target][1]}`
                      }
                      dataKey="y2"
                      stroke="#97da7b"
                      dot={false}
                      activeDot={{ strokeWidth: 2 }}
                    />
                  ) : null}
                  {compare ? (
                    <Line
                      name={
                        compare
                          ? `${LASTDAY[timeSpan]}${
                              LEGEND[CHARTTYPES[currentChart]][target][0]
                            }`
                          : `${LEGEND[CHARTTYPES[currentChart]][target][0]}`
                      }
                      dataKey="lasty"
                      stroke="#ffa312"
                      dot={false}
                      activeDot={{ strokeWidth: 2 }}
                    />
                  ) : null}
                  {compare && data2Name[currentChart] ? (
                    <Line
                      name={
                        compare
                          ? `${LASTDAY[timeSpan]}${
                              LEGEND[CHARTTYPES[currentChart]][target][1]
                            }`
                          : `${LEGEND[CHARTTYPES[currentChart]][target][1]}`
                      }
                      dataKey="lasty2"
                      stroke="#ff5555"
                      dot={false}
                      activeDot={{ strokeWidth: 2 }}
                    />
                  ) : null}
                </LineChart>
              </div>
            </div>
          ) : null}
          {currentChart === 6 ? (
            <div>
              <div className="areaChartWrapper">
                <AreaChart
                  width={CONSTANTS.CHARTWIDTH}
                  height={CONSTANTS.CHARTHEIGHT}
                  data={areaData}
                  margin={{ top: 10, right: 20, bottom: 0, left: 40 }}
                >
                  <CartesianGrid vertical={false} horizontal={false} />
                  <XAxis
                    padding={{ left: 20 }}
                    axisLine={{ stroke: '#ddd' }}
                    name=""
                    dataKey="x"
                    tickLine={false}
                  />
                  <YAxis
                    axisLine={{ stroke: '#ddd' }}
                    domain={[0, 'dataMax']}
                    tickLine={false}
                    tick={<AreaYAxisTick />}
                  />
                  <Tooltip
                    isAnimationActive={false}
                    cursor={{ stroke: '#222', strokeWidth: 1 }}
                    content={<AreaTooltip monthStr={monthStr} />}
                  />
                  <Legend
                    align="left"
                    verticalAlign="top"
                    margin={{ left: -20 }}
                    wrapperStyle={{ paddingLeft: 20, top: -15 }}
                    content={<AreaLegend />}
                    height={36}
                  />
                  <Area
                    name="客服处理时间"
                    type="monotone"
                    dataKey="assign"
                    stackId="1"
                    fill="#ff5555"
                    stroke="false"
                    activeDot={{
                      stroke: '#ff5555',
                      strokeWidth: 2,
                      fill: '#fff'
                    }}
                  />
                  <Area
                    name="维修员接受时间"
                    type="monotone"
                    dataKey="y"
                    stackId="1"
                    fill="#4aaaef"
                    stroke="false"
                    activeDot={{
                      stroke: '#4aaaef',
                      strokeWidth: 2,
                      fill: '#fff'
                    }}
                  />
                  <Area
                    name="维修时间"
                    type="monotone"
                    dataKey="repair"
                    stackId="1"
                    fill="#97da7b"
                    stroke="false"
                    activeDot={{
                      stroke: '#97da7b',
                      strokeWidth: 2,
                      fill: '#fff'
                    }}
                  />
                </AreaChart>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    schoolId: state.statModule[subModule].schoolId,
    timeSpan: state.statModule[subModule].timeSpan,
    currentChart: state.statModule[subModule].currentChart,
    target: state.statModule[subModule].target,
    compare: state.statModule[subModule].compare,
    currentMonth: state.statModule[subModule].currentMonth,
    monthStr: state.statModule[subModule].monthStr,
    startTime: state.statModule[subModule].startTime,
    endTime: state.statModule[subModule].endTime,
    schools: state.setSchoolList.schools,
    schoolSet: state.setSchoolList.schoolSet
  }
}

export default withRouter(
  connect(mapStateToProps, {
    changeStat,
    setSchoolList
  })(Charts)
)

class CustomizedTooltip extends React.Component {
  render() {
    const { payload, label, active } = this.props
    const ys =
      !!payload &&
      payload.filter((r, i) => {
        return r.dataKey === 'y'
      })
    const yItems =
      !!ys &&
      ys.map((r, i) => {
        if (r.payload.x) {
          return (
            <li key={i}>
              <svg key={`svg${i}`} className="lineIcon">
                <line x1="0" x2="5" y1={5} y2={5} stroke={r.stroke} />
                <circle
                  cx="7"
                  cy={5}
                  r="2"
                  stroke={r.stroke}
                  fill="transparent"
                />
                <line
                  x1="9"
                  x2="14"
                  y1={5}
                  y2={5}
                  stroke={r.stroke}
                  fill="transparent"
                />
              </svg>
              <span key={`span${i}`} className="name">
                {r.name}
              </span>
              <span key={`span2${i}`}>{r.value}</span>
            </li>
          )
        } else {
          return null
        }
      })

    const y2s =
      !!payload &&
      payload.filter((r, i) => {
        return r.dataKey === 'y2'
      })
    const y2Items =
      !!y2s &&
      y2s.map((r, i) => {
        if (r.payload.x) {
          return (
            <li key={i}>
              <svg key={`svg${i}`} className="lineIcon">
                <line x1="0" x2="5" y1={5} y2={5} stroke={r.stroke} />
                <circle
                  cx="7"
                  cy={5}
                  r="2"
                  stroke={r.stroke}
                  fill="transparent"
                />
                <line
                  x1="9"
                  x2="14"
                  y1={5}
                  y2={5}
                  stroke={r.stroke}
                  fill="transparent"
                />
              </svg>
              <span key={`span${i}`} className="name">
                {r.name}
              </span>
              <span key={`span2${i}`}>{r.value}</span>
            </li>
          )
        } else {
          return null
        }
      })

    const lastys =
      !!payload &&
      payload.filter((r, i) => {
        return r.dataKey === 'lasty'
      })
    const lastYItems =
      !!lastys &&
      lastys.map((r, i) => {
        return (
          <li key={i}>
            <svg key={`svg${i}`} className="lineIcon">
              <line x1="0" x2="5" y1={5} y2={5} stroke={r.stroke} />
              <circle
                cx="7"
                cy={5}
                r="2"
                stroke={r.stroke}
                fill="transparent"
              />
              <line
                x1="9"
                x2="14"
                y1={5}
                y2={5}
                stroke={r.stroke}
                fill="transparent"
              />
            </svg>
            <span key={`span${i}`} className="name">
              {r.name}
            </span>
            <span key={`span2${i}`}>{r.value}</span>
          </li>
        )
      })

    const lasty2s =
      !!payload &&
      payload.filter((r, i) => {
        return r.dataKey === 'lasty2'
      })
    const lastY2Items =
      !!lasty2s &&
      lasty2s.map((r, i) => {
        return (
          <li key={i}>
            <svg key={`svg${i}`} className="lineIcon">
              <line x1="0" x2="5" y1={5} y2={5} stroke={r.stroke} />
              <circle
                cx="7"
                cy={5}
                r="2"
                stroke={r.stroke}
                fill="transparent"
              />
              <line
                x1="9"
                x2="14"
                y1={5}
                y2={5}
                stroke={r.stroke}
                fill="transparent"
              />
            </svg>
            <span key={`span${i}`} className="name">
              {r.name}
            </span>
            <span key={`span2${i}`}>{r.value}</span>
          </li>
        )
      })

    if (active) {
      return (
        <div className="tooltip">
          <ul>
            {label ? <li className="label">{label}</li> : null}
            {!!ys ? yItems : null}
            {!!y2s ? y2Items : null}
            {!!lastys.length ? (
              <li className="label">{lastys[0].payload.lastX}</li>
            ) : null}
            {!!lastys.length ? lastYItems : null}
            {!!lasty2s.length ? lastY2Items : null}
          </ul>
        </div>
      )
    } else {
      return null
    }
  }
}
class CustomizedXAxisTick extends React.Component {
  render() {
    const { x, y, payload, timeUnit } = this.props

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dx={5}
          dy={12}
          textAnchor="end"
          fill="#999"
          transform="rotate(-35)"
        >
          {timeUnit === 2
            ? Format.dayLabel(payload.value)
            : Format.hourLabel(payload.value)}
        </text>
      </g>
    )
  }
}

class CustomizedAxisTick extends React.Component {
  render() {
    const { x, y, payload } = this.props

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={0} textAnchor="end" fill="#999">
          {payload.value}
        </text>
      </g>
    )
  }
}
const AreaLegend = props => {
  const { payload } = props

  return (
    <ul>
      {payload.map((entry, index) => (
        <span className="rectLegend" key={`item-${index}`}>
          <svg key={`svg${index}`} className="rectIcon">
            <rect
              x="0"
              y="0"
              width="20"
              height="10"
              fill={entry.payload.fill}
            />
          </svg>
          {entry.value}
        </span>
      ))}
    </ul>
  )
}

class AreaTooltip extends React.Component {
  render() {
    const { payload, label, active, monthStr } = this.props

    const payloads =
      payload &&
      payload.reverse().map((r, i) => {
        return (
          <li key={i}>
            <svg key={`svg${i}`} className="rectIcon">
              <rect x="0" y="0" width="20" height="10" fill={r.fill} />
            </svg>
            <span key={`span${i}`} className="name">
              {r.name}
            </span>
            <span key={`span2${i}`}>{r.value}</span>
          </li>
        )
      })
    if (active) {
      return (
        <div className="tooltip">
          <ul>
            <li className="label">
              {Format.monthFormat(monthStr)} {label}
            </li>
            {payloads}
          </ul>
        </div>
      )
    } else {
      return null
    }
  }
}

const AreaYAxisTick = props => {
  const { x, y, payload } = props

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={0} textAnchor="end" fill="#999">
        {payload.value}小时
      </text>
    </g>
  )
}
