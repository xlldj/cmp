import React, { Component } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts'
import SchoolSelector from '../../component/schoolSelector'
import Switch from 'antd/lib/switch'
import Icon from 'antd/lib/icon'
import DatePicker from 'antd/lib/date-picker'
import AjaxHandler from '../../../util/ajax'
import Format from '../../component/format'
import CONSTANTS from '../../component/constants'
import Time from '../../component/time'
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
  totalWater: 0,
  totalShower: 0
}

export default class RepairChart extends Component {
  state = initilaState

  fetchData = body => {
    let resource = '/api/statistics/repair/polyline'
    const cb = json => {
      let nextState = {
        loading: false
      }
      if (json.error) {
        throw new Error(json.error)
      } else {
        let showerPoints = json.data.showerPoints,
          waterPoints = json.data.waterPoints
        let { startTime, endTime, timeUnit } = this.state,
          data
        if (timeUnit === 2) {
          data = Time.getDateArray(startTime, endTime)
          data.forEach((r, i) => {
            let t = Date.parse(new Date(r.x))
            if (t < NOW) {
              r.y = 0
              r.water = 0
            }
          })
          showerPoints &&
            showerPoints.forEach((r, i) => {
              let x = Format.dayFormat(r.x)
              let xInData = data.find((r, i) => r.x === x)
              if (xInData) {
                xInData.y = r.y //push shower points into data array
              }
            })
          waterPoints &&
            waterPoints.forEach((r, i) => {
              let x = Format.dayFormat(r.x)
              let xInData = data.find((r, i) => r.x === x)
              if (xInData) {
                xInData.water = r.y //push shower points into data array
              }
            })
        } else {
          data = Time.getHourArray(startTime, endTime)
          data.forEach((r, i) => {
            let t = Date.parse(new Date(r.x))
            if (t < NOW) {
              r.y = 0
              r.water = 0
            }
          })
          showerPoints &&
            showerPoints.forEach((r, i) => {
              let x = Format.hourFormat(r.x)
              let xInData = data.find((r, i) => r.x === x)
              if (xInData) {
                xInData.y = r.y //push shower points into data array
              }
            })
          waterPoints &&
            waterPoints.forEach((r, i) => {
              let x = Format.hourFormat(r.x)
              let xInData = data.find((r, i) => r.x === x)
              if (xInData) {
                xInData.water = r.y //push shower points into data array
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
    let { startTime, endTime, timeUnit, compare } = this.state
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
      body.schoolId = parseInt(v, 10)
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
    let resource = '/api/statistics/repair/polyline'
    const body = {
      startTime: newStartTime,
      endTime: newEndTime,
      timeUnit: timeUnit
    }
    if (selectedSchool !== 'all') {
      body.schoolId = parseInt(selectedSchool, 10)
    }
    const cb = json => {
      let nextState = {
        loading: false
      }
      if (json.error) {
        throw new Error(json.error)
      } else {
        let showerPoints = json.data.showerPoints,
          waterPoints = json.data.waterPoints,
          newData = JSON.parse(JSON.stringify(this.state.data)),
          timeSpan = this.state.timeSpan
        if (timeSpan === 1) {
          newData.forEach((r, i) => {
            r.lastShower = 0
            r.lastWater = 0
            let lastX = Time.ago24Hour(r.x) //取得24小时之前的时间
            r.lastX = lastX
          })
          showerPoints &&
            showerPoints.forEach((r, i) => {
              let item = newData.find(
                (record, ind) => Format.hourFormat(r.x) === record.lastX
              )
              if (item) {
                item.lastShower = r.y
              }
            })
          waterPoints &&
            waterPoints.forEach((r, i) => {
              let item = newData.find(
                (record, ind) => Format.hourFormat(r.x) === record.lastX
              )
              if (item) {
                item.lastWater = r.y
              }
            })
        } else if (timeSpan === 2) {
          newData.forEach((r, i) => {
            r.lastShower = 0
            r.lastWater = 0
            let lastX = Time.ago1Week(r.x) //取得24小时之前的时间
            r.lastX = lastX
          })
          showerPoints &&
            waterPoints.forEach((r, i) => {
              let item = newData.find(
                (record, ind) => record.lastX === Format.dayFormat(r.x)
              )
              if (item) {
                item.lastShower = r.y
              }
            })
          waterPoints &&
            waterPoints.forEach((r, i) => {
              let item = newData.find(
                (record, ind) => record.lastX === Format.dayFormat(r.x)
              )
              if (item) {
                item.lastWater = r.y
              }
            })
        } else {
          let lastMonthArray = Time.getDateArray(
            Time.getLastMonthStart(),
            Time.getLastMonthEnd()
          )
          lastMonthArray.forEach((r, i) => {
            if (i < newData.length) {
              newData[i].lastShower = 0
              newData[i].lastWater = 0
              newData[i].lastX = r.x
            } else {
              newData.push({
                lastX: r.x,
                lastShower: 0,
                lastWater: 0
              })
            }
          })
          showerPoints &&
            showerPoints.forEach((r, i) => {
              let item = newData.find(
                (record, ind) => record.lastX === Format.dayFormat(r.x)
              )
              if (item) {
                item.lastShower = r.y
              }
            })
          waterPoints &&
            waterPoints.forEach((r, i) => {
              let item = newData.find(
                (record, ind) => record.lastX === Format.dayFormat(r.x)
              )
              if (item) {
                item.lastWater = r.y
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
        delete r.lastShower
        delete r.lastWater
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
    let v = parseInt(e.target.getAttribute('data-value'), 10)
    let { selectedSchool, timeSpan, compare } = this.state
    if (v === timeSpan) {
      return
    }
    const body = {}
    if (selectedSchool !== 'all') {
      body.schoolId = parseInt(selectedSchool, 10)
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
    let { selectedSchool } = this.state
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
      body.schoolId = parseInt(selectedSchool, 10)
    }
    this.fetchData(body)
    this.setState(nextState)
  }

  render() {
    const {
      data,
      startTime,
      endTime,
      selectedSchool,
      timeUnit,
      loading,
      timeSpan,
      compare,
      totalShower,
      totalWater
    } = this.state
    return (
      <div className="chart">
        <h1>设备报修统计</h1>

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
              <span className="padLR twoLine">
                <span>热水器总数：{totalShower}</span>
                <br />
                <span>饮水机总数：{totalWater}</span>
              </span>
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
                axisLine={{ stroke: '#ddd' }}
                domain={['auto', 'auto']}
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
                name={compare ? `${DAY[timeSpan]}热水器报修` : '热水器报修'}
                dataKey="y"
                stroke="#4aaaef"
                dot={false}
                activeDot={{ strokeWidth: 2 }}
              />
              <Line
                name={compare ? `${DAY[timeSpan]}饮水机报修` : '饮水机报修'}
                dataKey="water"
                stroke="#97da7b"
                dot={false}
                activeDot={{ strokeWidth: 2 }}
              />
              {compare ? (
                <Line
                  name={
                    compare ? `${LASTDAY[timeSpan]}热水器报修` : '热水器报修'
                  }
                  dataKey="lastShower"
                  stroke="#ffa312"
                  dot={false}
                  activeDot={{ strokeWidth: 2 }}
                />
              ) : null}
              {compare ? (
                <Line
                  name={
                    compare ? `${LASTDAY[timeSpan]}饮水机报修` : '饮水机报修'
                  }
                  dataKey="lastWater"
                  stroke="#ff5555"
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

    const waters =
      !!payload &&
      payload.filter((r, i) => {
        return r.dataKey === 'water'
      })
    const waterItems =
      !!waters &&
      waters.map((r, i) => {
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

    const lastShowers =
      !!payload &&
      payload.filter((r, i) => {
        return r.dataKey === 'lastShower'
      })
    const lastShowerItems =
      !!lastShowers &&
      lastShowers.map((r, i) => {
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

    const lastWaters =
      !!payload &&
      payload.filter((r, i) => {
        return r.dataKey === 'lastWater'
      })
    const lastWaterItems =
      !!lastWaters &&
      lastWaters.map((r, i) => {
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
            {!!waters ? waterItems : null}
            {!!lastShowers.length ? (
              <li className="label">{lastShowers[0].payload.lastX}</li>
            ) : null}
            {!!lastShowers.length ? lastShowerItems : null}
            {!!lastWaters.length ? lastWaterItems : null}
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
})

const CustomizedYAxisTick = React.createClass({
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
})
