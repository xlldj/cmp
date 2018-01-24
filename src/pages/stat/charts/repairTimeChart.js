import React, { Component } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts'
import SchoolSelector from '../../component/schoolSelector'
import Icon from 'antd/lib/icon'
import DatePicker from 'antd/lib/date-picker'
import AjaxHandler from '../../../util/ajax'
import Format from '../../component/format'
import CONSTANTS from '../../component/constants'
import Time from '../../component/time'
import moment from 'moment'
const { MonthPicker } = DatePicker

const NOW = Date.parse(new Date())
const CURMONTHSTR = Time.getMonthFormat(NOW)
const TIMEUNIT = 3
/*----------timeUnit:始终为3------------*/

const data03 = []

const initilaState = {
  data: data03,
  loading: false,
  selectedSchool: 'all',
  startTime: Time.getFirstWeekStart(Time.getMonthStart(NOW)),
  endTime: Time.getTheLastWeekEnd(Time.getMonthEnd(NOW)),
  currentMonth: true,
  monthStr: ''
}

export default class RepairTimeChart extends Component {
  state = initilaState

  fetchData = body => {
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
        let { startTime } = this.state
        //starttime是第一个周一的0点，用它减去该年第一天0点，除以7*24*3600*1000，就得到了中间有多少周

        let startWeekNum = Time.getFirstWeekNum(startTime)
        for (let i = 0; i < 4; i++) {
          let monday = startTime + i * 7 * 24 * 3600 * 1000
          let item = {
            x: `第${i + 1}周`,
            num: startWeekNum + i
          }
          //如果周一的0点已经过去，就将所有的值值为0
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
            item && (item.y = r.y)
          })
        assignTime &&
          assignTime.forEach((r, i) => {
            let item = data.find(
              (record, ind) => record.num === Format.getWeekNum(r.x)
            )
            item && (item.assign = r.y)
          })
        repairTime &&
          repairTime.forEach((r, i) => {
            let item = data.find(
              (record, ind) => record.num === Format.getWeekNum(r.x)
            )
            item && (item.repair = r.y)
          })
        nextState.data = data
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb)
  }

  componentDidMount() {
    const body = {
      endTime: Time.getTheLastWeekEnd(Time.getMonthEnd(NOW)),
      startTime: Time.getFirstWeekStart(Time.getMonthStart(NOW)),
      timeUnit: TIMEUNIT
    }
    this.fetchData(body)
    let monthStr = Time.getMonthFormat(this.state.startTime)
    this.setState({
      monthStr: monthStr
    })
  }

  changeSchool = v => {
    let { startTime, endTime } = this.state
    let nextState = {
      selectedSchool: v,
      loading: true
    }
    const body = {
      startTime: startTime,
      endTime: endTime,
      timeUnit: TIMEUNIT
    }
    if (v !== 'all') {
      body.schoolId = parseInt(v, 10)
    }
    this.setState(nextState)
    this.fetchData(body)
  }

  selectRange = (date, dateString) => {
    let { monthStr, selectedSchool } = this.state
    if (dateString === monthStr) {
      return
    }
    let newStartTime = Time.getFirstWeekStart(
        Time.getMonthStart(dateString + '-1')
      ),
      newEndTime = Time.getTheLastWeekEnd(Time.getMonthEnd(dateString + '-1'))
    let nextState = {
      monthStr: dateString,
      loading: true,
      startTime: newStartTime,
      endTime: newEndTime
    }
    const body = {
      timeUnit: TIMEUNIT,
      startTime: newStartTime,
      endTime: newEndTime
    }
    if (selectedSchool !== 'all') {
      body.schoolId = parseInt(selectedSchool, 10)
    }
    this.fetchData(body)
    if (dateString === CURMONTHSTR) {
      nextState.currentMonth = true
    } else {
      nextState.currentMonth = false
    }
    this.setState(nextState)
  }

  changeCurrent = e => {
    e.preventDefault()
    let { currentMonth, selectedSchool } = this.state
    if (currentMonth) {
      return
    }
    let newStartTime = Time.getFirstWeekStart(Time.getMonthStart(NOW)),
      newEndTime = Time.getTheLastWeekEnd(Time.getMonthEnd(NOW))
    const body = {
      startTime: newStartTime,
      endTime: newEndTime,
      timeUnit: TIMEUNIT
    }
    if (selectedSchool !== 'all') {
      body.schoolId = selectedSchool
    }
    this.fetchData(body)
    this.setState({
      startTime: newStartTime,
      endTime: newEndTime,
      currentMonth: true,
      loading: true,
      monthStr: CURMONTHSTR
    })
  }

  render() {
    const { data, selectedSchool, loading, currentMonth, monthStr } = this.state
    return (
      <div className="chart">
        <h1>设备报修处理时间统计</h1>

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
            </div>
            <div>
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
          </div>

          <div className="lineChartWrapper">
            <AreaChart
              width={CONSTANTS.CHARTWIDTH}
              height={CONSTANTS.CHARTHEIGHT}
              data={data}
              margin={{ top: 10, right: 20, bottom: 0, left: 0 }}
            >
              <CartesianGrid vertical={false} horizontal={false} />
              <XAxis
                axisLine={{ stroke: '#ddd' }}
                name=""
                dataKey="x"
                tickLine={false}
              />
              <YAxis
                axisLine={{ stroke: '#ddd' }}
                domain={[0, 'dataMax']}
                tickLine={false}
                tick={<CustomizedYAxisTick />}
              />
              <Tooltip
                isAnimationActive={false}
                cursor={{ stroke: '#222', strokeWidth: 1 }}
                content={<CustomizedTooltip monthStr={monthStr} />}
              />
              <Legend
                align="left"
                verticalAlign="top"
                margin={{ left: -20 }}
                wrapperStyle={{ paddingLeft: 20, top: -15 }}
                content={<CustomizedLegend />}
                height={36}
              />
              <Area
                name="客服处理时间"
                type="monotone"
                dataKey="assign"
                stackId="1"
                fill="#ff5555"
                stroke="false"
                activeDot={{ stroke: '#ff5555', strokeWidth: 2, fill: '#fff' }}
              />
              <Area
                name="维修员接受时间"
                type="monotone"
                dataKey="y"
                stackId="1"
                fill="#4aaaef"
                stroke="false"
                activeDot={{ stroke: '#4aaaef', strokeWidth: 2, fill: '#fff' }}
              />
              <Area
                name="维修时间"
                type="monotone"
                dataKey="repair"
                stackId="1"
                fill="#97da7b"
                stroke="false"
                activeDot={{ stroke: '#97da7b', strokeWidth: 2, fill: '#fff' }}
              />
            </AreaChart>
          </div>
        </div>
      </div>
    )
  }
}

const CustomizedLegend = props => {
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

const CustomizedTooltip = React.createClass({
  render() {
    const { payload, label, active, monthStr } = this.props

    const payloads =
      payload &&
      payload.map((r, i) => {
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
})

const CustomizedYAxisTick = React.createClass({
  render() {
    const { x, y, payload } = this.props

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={0} textAnchor="end" fill="#999">
          {payload.value}小时
        </text>
      </g>
    )
  }
})
