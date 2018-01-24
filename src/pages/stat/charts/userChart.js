import React, { Component } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Label,
  LabelList
} from 'recharts'
import { scalePow, scaleLog } from 'd3-scale'
import SchoolSelector from '../../component/schoolSelector'
import Select from 'antd/lib/select'
import Switch from 'antd/lib/switch'
import Icon from 'antd/lib/icon'
import DatePicker from 'antd/lib/date-picker'
import AjaxHandler from '../../../util/ajax'
import Format from '../../../util/format'
import CONSTANTS from '../../component/constants'
import Time from '../../../util/time'
import Noti from '../../../util/noti'
import moment from 'moment'
const { RangePicker } = DatePicker

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
/*----------timeUnit:1-hour,2-day------------*/
/*----------timespan: 1-今日，2-本周,3-本月-----*/

const data03 = []

const initilaState = {
  data: data03,
  loading: false,
  selectedSchool: 'all',
  timeUnit: 2,
  startTime: Time.getWeekStart(NOW),
  endTime: Time.getWeekEnd(NOW),
  compare: false,
  compareLock: false,
  compareNeed: false,
  timeSpan: 2,
  totalAmount: 0
}

export default class UserChart extends Component {
  state = initilaState

  fetchData = body => {
    let resource = '/api/statistics/user/polyline'
    const cb = json => {
      let nextState = {
        loading: false
      }
      if (json.error) {
        throw new Error(json.error)
      } else {
        let newlyPoints = json.data.newlyPoints,
          data
        let { startTime, endTime, timeUnit } = this.state
        if (timeUnit === 2) {
          data = Time.getDateArray(startTime, endTime)
          data.map((r, i) => {
            let t = Date.parse(new Date(r.x))
            if (t < NOW) {
              r.y = 0
            }
          })
          newlyPoints &&
            newlyPoints.map((r, i) => {
              let x = Format.dayFormat(r.x)
              let xInData = data.find((r, i) => r.x === x)
              if (xInData) {
                xInData.y = r.y
              }
            })
        } else {
          data = Time.getHourArray(startTime, endTime)
          data.map((r, i) => {
            let t = Date.parse(new Date(r.x))
            if (t < NOW) {
              r.y = 0
            }
          })
          newlyPoints &&
            newlyPoints.map((r, i) => {
              let x = Format.hourFormat(r.x)
              let xInData = data.find((r, i) => r.x === x)
              if (xInData) {
                xInData.y = r.y //push shower points into data array
              }
            })
        }
        nextState.data = data
      }
      if (this.state.compare && this.state.compareNeed) {
        this.fetchCompareData()
        nextState.loading = true
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb)
  }

  componentDidMount() {
    const body = {
      endTime: Time.getWeekEnd(NOW),
      startTime: Time.getWeekStart(NOW),
      timeUnit: 2
    }
    this.fetchData(body)
  }

  changeSchool = v => {
    let { startTime, endTime, timeUnit, selectedSchool, compare } = this.state
    let nextState = {
      selectedSchool: v,
      loading: true
    }
    const body = {
      startTime: startTime,
      endTime: endTime,
      timeUnit: timeUnit
    }
    if (v !== 'all') {
      body.schoolId = parseInt(v)
    }
    if (compare) {
      nextState.compareNeed = true
    }
    this.setState(nextState)
    this.fetchData(body)
  }

  fetchCompareData = () => {
    this.setState({
      compareNeed: false
    })
    let { timeUnit, selectedSchool, timeSpan } = this.state
    let newStartTime,
      newEndTime /*----------------------------------------------*/
    if (timeSpan === 1) {
      newStartTime = Time.getYestodayStart()
      newEndTime = Time.getYestodayEnd()
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
    let resource = '/api/statistics/user/polyline'
    const body = {
      startTime: newStartTime,
      endTime: newEndTime,
      timeUnit: timeUnit
    }
    if (selectedSchool !== 'all') {
      body.schoolId = parseInt(selectedSchool)
    }

    const cb = json => {
      let nextState = {
        loading: false
      }
      if (json.error) {
        throw new Error(json.error)
      } else {
        let newlyPoints = json.data.newlyPoints,
          newData = JSON.parse(JSON.stringify(this.state.data))
        //将过去的数据转为本日/周/月的数据，再将其插入data数组中
        if (timeSpan === 1) {
          newData.map((r, i) => {
            r.lastUser = 0
            let lastX = Time.ago24Hour(r.x) //取得24小时之前的时间
            r.lastX = lastX
          })
          newlyPoints &&
            newlyPoints.map((r, i) => {
              let item = newData.find(
                (record, ind) => Format.hourFormat(r.x) === record.lastX
              )
              if (item) {
                item.lastUser = r.y
              }
            })
        } else if (timeSpan === 2) {
          newData.map((r, i) => {
            r.lastUser = 0
            let lastX = Time.ago1Week(r.x) //取得24小时之前的时间
            r.lastX = lastX
          })
          newlyPoints &&
            newlyPoints.map((r, i) => {
              let corresX = Time.add1Week(r.x)
              let item = newData.find(
                (record, ind) => Format.dayFormat(r.x) === record.lastX
              )
              if (item) {
                item.lastUser = r.y
              }
            })
        } else {
          //转换为月
          let lastMonthArray = Time.getDateArray(
            Time.getLastMonthStart(),
            Time.getLastMonthEnd()
          )
          lastMonthArray.map((r, i) => {
            if (i < newData.length) {
              newData[i].lastUser = 0
              newData[i].lastX = r.x
            } else {
              newData.push({
                lastX: r.x,
                lastUser: 0
              })
            }
          })
          newlyPoints &&
            newlyPoints.map((r, i) => {
              let item = newData.find(
                (record, ind) => record.lastX === Format.dayFormat(r.x)
              )
              if (item) {
                item.lastUser = r.y
              }
            })
        }
        console.log(newData)
        nextState.data = newData
      }
      this.setState(nextState)
    }
    console.log(body)
    AjaxHandler.ajax(resource, body, cb)
  }

  removeCompareData = () => {
    /*-----------后续查看是否需要重新拉取数据，因为可能比较两月时，当前月的数据比上月少，删除上月后当前数据中有无效长度，重新拉取会呈现地更好-------------*/
    let { data, compare } = this.state,
      newData = JSON.parse(JSON.stringify(data))
    newData &&
      newData.map((r, i) => {
        delete r.lastUser
      })
    this.setState({
      data: newData,
      compare: false
    })
  }

  compareLast = checked => {
    if (this.state.compareLock) {
      return Noti.hintLock(
        '当前状态下不能比较！',
        '请选择本日/本周/本月后再进行比较'
      )
    }
    let nextState = {
      compare: checked
    }
    if (checked) {
      this.fetchCompareData()
      nextState.compareNeed = true
    } else {
      this.removeCompareData()
      nextState.compareNeed = false
    }
    this.setState(nextState)
  }

  changeTimeSpan = e => {
    /*-----------if compared,clean it-----------*/
    e.preventDefault()
    let v = parseInt(e.target.getAttribute('data-value'))
    let {
      startTime,
      endTime,
      timeUnit,
      selectedSchool,
      timeSpan,
      compare
    } = this.state
    if (v === timeSpan) {
      return
    }
    const body = {}
    if (selectedSchool !== 'all') {
      body.schoolId = parseInt(selectedSchool)
    }
    /*--------start and end---------*/
    let newStartTime, newEndTime
    let nextState = {
      timeSpan: v,
      loading: true,
      compareLock: false
    }
    if (v === 1) {
      //today
      newStartTime = Time.getDayStart(NOW)
      newEndTime = Time.getDayEnd(NOW)
      nextState.timeUnit = 1
      body.timeUnit = 1
    } else if (v === 2) {
      newStartTime = Time.getWeekStart(NOW)
      newEndTime = Time.getWeekEnd(NOW)
      nextState.timeUnit = 2
      body.timeUnit = 2
    } else {
      newStartTime = Time.getMonthStart(NOW)
      newEndTime = Time.getMonthEnd(NOW)
      nextState.timeUnit = 2
      body.timeUnit = 2
    }
    body.startTime = newStartTime
    body.endTime = newEndTime
    this.fetchData(body)

    nextState.startTime = newStartTime
    nextState.endTime = newEndTime
    if (compare) {
      nextState.compareNeed = true
    }
    this.setState(nextState)
  }

  selectRange = (dates, dateStrings) => {
    /*-----------------后续需要检查选择的时间间隔大小来确定timeunit----------------*/
    let newStartTime = Time.getDayStart(dateStrings[0]),
      newEndTime = Time.getDayEnd(dateStrings[1])
    let { startTime, endTime, timeUnit, selectedSchool, timeSpan } = this.state
    let nextState = {
      loading: true,
      compare: false,
      compareLock: true,
      startTime: newStartTime,
      endTime: newEndTime,
      timeUnit: 2,
      timeSpan: ''
    }
    const body = {
      timeUnit: 2,
      startTime: newStartTime,
      endTime: newEndTime
    }
    if (selectedSchool !== 'all') {
      body.schoolId = parseInt(selectedSchool)
    }
    this.fetchData(body)
    this.setState(nextState)
  }

  render() {
    const {
      data,
      selectedSchool,
      startTime,
      endTime,
      timeUnit,
      loading,
      timeSpan,
      compare,
      totalAmount
    } = this.state
    return (
      <div className="chart">
        <h1>用户统计</h1>

        <div>
          <div
            className={loading ? 'loadingWrapper show' : 'loadingWrapper hide'}
          >
            <span>
              <Icon type="loading" />
            </span>加载中...
          </div>

          <div className="query">
            <div>
              <SchoolSelector
                className="padR"
                width={CONSTANTS.SHORTSELECTOR}
                selectedSchool={selectedSchool}
                changeSchool={this.changeSchool}
              />
              <span className="padLR">用户总数{totalAmount}</span>
            </div>
            <div>
              <span className="compare">对比{LASTDAY[timeSpan]}</span>
              <Switch
                checked={compare}
                size="small"
                onChange={this.compareLast}
              />
            </div>
            <div>
              <a
                data-value={1}
                className={timeSpan === 1 ? 'padR on' : 'padR'}
                onClick={this.changeTimeSpan}
              >
                本日
              </a>
              <a
                data-value={2}
                className={timeSpan === 2 ? 'padR on' : 'padR'}
                onClick={this.changeTimeSpan}
              >
                本周
              </a>
              <a
                data-value={3}
                className={timeSpan === 3 ? 'padR on' : 'padR'}
                onClick={this.changeTimeSpan}
              >
                本月
              </a>
              <RangePicker
                allowClear={false}
                value={[
                  moment(Time.getDayFormat(startTime)),
                  moment(Time.getDayFormat(endTime))
                ]}
                className="rangePicker"
                onChange={this.selectRange}
              />
            </div>
          </div>

          <div className="lineChartWrapper">
            <LineChart
              width={CONSTANTS.CHARTWIDTH}
              height={CONSTANTS.CHARTHEIGHT}
              data={data}
              margin={{ top: 10, right: 20, bottom: 0, left: 0 }}
            >
              <CartesianGrid vertical={false} horizontal={false} />
              <XAxis
                axisLine={{ stroke: '#ddd' }}
                name="date"
                dataKey="x"
                tick={<CustomizedXAxisTick timeUnit={timeUnit} />}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                axisLine={{ stroke: '#ddd' }}
                domain={[0, 'dataMax']}
                tickLine={false}
                tick={<CustomizedYAxisTick />}
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
                name={compare ? `${DAY[timeSpan]}新增用户` : '新增用户'}
                dataKey="y"
                stroke="#4aaaef"
                dot={false}
                activeDot={{ strokeWidth: 2 }}
              />
              {compare ? (
                <Line
                  name={compare ? `${LASTDAY[timeSpan]}新增用户` : '新增用户'}
                  dataKey="lastUser"
                  stroke="#ffa312"
                  dot={false}
                  activeDot={{ strokeWidth: 2 }}
                />
              ) : null}
            </LineChart>
          </div>
        </div>
      </div>
    )
  }
}

const CustomizedTooltip = React.createClass({
  render() {
    const { type, payload, label, active, timeUnit } = this.props

    const cur = !!payload && payload.filter((r, i) => r.dataKey === 'y')
    const curItems =
      !!cur &&
      cur.map((r, i) => {
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
        }
      })

    const last = !!payload && payload.filter((r, i) => r.dataKey === 'lastUser')
    const lastItems =
      !!last.length &&
      last.map((r, i) => {
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
            {!!cur ? curItems : null}
            {!!last.length ? (
              <li className="label">{last[0].payload.lastX}</li>
            ) : null}
            {!!last.length ? lastItems : null}
          </ul>
        </div>
      )
    } else {
      return null
    }
  }
})

const CustomizedXAxisTick = React.createClass({
  render() {
    const { x, y, stroke, payload, timeUnit } = this.props

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
})

const CustomizedYAxisTick = React.createClass({
  render() {
    const { x, y, stroke, payload } = this.props

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={0} textAnchor="end" fill="#999">
          {payload.value}
        </text>
      </g>
    )
  }
})
