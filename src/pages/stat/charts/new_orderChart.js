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
/*----------target:1-订单数量，2-订单收益--------*/
/*----------timespan: 1-今日，2-本周,3-本月-----*/

const initilaState = {
  data: [],
  loading: false,
  selectedSchool: 'all',
  target: 1,
  timeUnit: 2,
  startTime: Time.getWeekStart(NOW),
  endTime: Time.getWeekEnd(NOW),
  compare: false,
  timeSpan: 2
}

export default class Chart extends Component {
  state = initilaState

  fetchData = body => {
    this.setState({
      loading: true
    })
    let resource = '/api/statistics/order/polyline'
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
          data.map((r, i) => {
            let t = Date.parse(new Date(r.x))
            if (t < NOW) {
              r.y = 0
              r.water = 0
            }
          })
          showerPoints &&
            showerPoints.map((r, i) => {
              let x = Format.dayFormat(r.x)
              let xInData = data.find((r, i) => r.x === x)
              if (xInData) {
                xInData.y = r.y //push shower points into data array
              }
            })
          waterPoints &&
            waterPoints.map((r, i) => {
              let x = Format.dayFormat(r.x)
              let xInData = data.find((r, i) => r.x === x)
              if (xInData) {
                xInData.water = r.y //push shower points into data array
              }
            })
        } else {
          data = Time.getHourArray(startTime, endTime)
          data.map((r, i) => {
            let t = Date.parse(new Date(r.x))
            if (t < NOW) {
              r.y = 0
              r.water = 0
            }
          })
          showerPoints &&
            showerPoints.map((r, i) => {
              let x = Format.hourFormat(r.x)
              let xInData = data.find((r, i) => r.x === x)
              if (xInData) {
                xInData.y = r.y //push shower points into data array
              }
            })
          waterPoints &&
            waterPoints.map((r, i) => {
              let x = Format.hourFormat(r.x)
              let xInData = data.find((r, i) => r.x === x)
              if (xInData) {
                xInData.water = r.y //push shower points into data array
              }
            })
        }
        nextState.data = data
      }
      if (this.state.compare) {
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
      target: 1,
      timeUnit: 2
    }
    this.fetchData(body)
  }

  changeTarget = e => {
    e.preventDefault()
    let v = parseInt(e.target.getAttribute('data-value'))
    let {
      target,
      startTime,
      endTime,
      timeUnit,
      selectedSchool,
      compare
    } = this.state
    if (v === target) {
      return
    }
    const body = {
      startTime: startTime,
      endTime: endTime,
      timeUnit: timeUnit,
      target: target
    }
    if (selectedSchool !== 'all') {
      body.schoolId = parseInt(selectedSchool)
    }
    this.fetchData(body)

    let nextState = {
      target: v
    }
    this.setState(nextState)
  }

  fetchCompareData = () => {
    this.setState({
      loading: true
    })
    let { target, timeUnit, selectedSchool, timeSpan } = this.state
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
    let resource = '/api/statistics/order/polyline'
    const body = {
      startTime: newStartTime,
      endTime: newEndTime,
      target: target,
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
        let showerPoints = json.data.showerPoints,
          waterPoints = json.data.waterPoints,
          newData = JSON.parse(JSON.stringify(this.state.data)),
          timeSpan = this.state.timeSpan
        //将过去的数据转为本日/周/月的数据，再将其插入data数组中
        if (timeSpan === 1) {
          newData.map((r, i) => {
            r.lastShower = 0
            r.lastWater = 0
            let lastX = Time.ago24Hour(r.x) //取得24小时之前的时间
            r.lastX = lastX
          })
          showerPoints &&
            showerPoints.map((r, i) => {
              let item = newData.find(
                (record, ind) => Format.hourFormat(r.x) === record.lastX
              )
              if (item) {
                item.lastShower = r.y
              }
            })
          waterPoints &&
            waterPoints.map((r, i) => {
              let item = newData.find(
                (record, ind) => Format.hourFormat(r.x) === record.lastX
              )
              if (item) {
                item.lastWater = r.y
              }
            })
        } else if (timeSpan === 2) {
          newData.map((r, i) => {
            r.lastShower = 0
            r.lastWater = 0
            let lastX = Time.ago1Week(r.x) //取得24小时之前的时间
            r.lastX = lastX
          })
          showerPoints &&
            waterPoints.map((r, i) => {
              let item = newData.find(
                (record, ind) => record.lastX === Format.dayFormat(r.x)
              )
              if (item) {
                item.lastShower = r.y
              }
            })
          waterPoints &&
            waterPoints.map((r, i) => {
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
          lastMonthArray.map((r, i) => {
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
            showerPoints.map((r, i) => {
              let item = newData.find(
                (record, ind) => record.lastX === Format.dayFormat(r.x)
              )
              if (item) {
                item.lastShower = r.y
              }
            })
          waterPoints &&
            waterPoints.map((r, i) => {
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
    let { data, compare } = this.state,
      newData = JSON.parse(JSON.stringify(data))
    newData &&
      newData.map((r, i) => {
        delete r.lastWater
        delete r.lastShower
      })
    this.setState({
      data: newData
    })
  }

  componentWillReceiveProps(nextProps) {
    let { startTime, endTime, selectedSchool, timeUnit, compare } = this.props,
      body = {},
      nextState = {}
    if (nextProps.selectedSchool !== selectedSchool) {
      nextState.selectedSchool = nextProps.selectedSchool

      body.startTime = this.state.startTime
      body.endTime = this.state.endTime
      body.timeUnit = this.state.timeUnit
      body.target = this.state.target
      if (nextState.selectedSchool !== 'all') {
        body.schoolId = parseInt(nextState.selectedSchool)
      }
      this.fetchData(body)
      this.setState(nextState)
    } else if (
      nextProps.startTime !== startTime ||
      nextProps.endTime !== endTime
    ) {
      nextState.startTime = nextProps.startTime
      nextState.endTime = nextProps.endTime
      nextState.timeUnit = nextProps.timeUnit
      nextState.timeSpan = nextProps.timeSpan
      nextState.compare = nextProps.compare

      body.startTime = nextProps.startTime
      body.endTime = nextProps.endTime
      body.timeUnit = nextProps.timeUnit
      body.target = this.state.target
      if (this.state.selectedSchool !== 'all') {
        body.schoolId = parseInt(this.state.selectedSchool)
      }
      this.fetchData(body)
      this.setState(nextState)
    } else if (nextProps.compare !== compare) {
      nextState.compare = nextProps.compare

      if (nextProps.compare) {
        this.fetchCompareData()
      } else {
        this.removeCompareData()
      }
      this.setState(nextState)
    }
  }

  render() {
    const {
      data,
      selectedSchool,
      startTime,
      endTime,
      timeUnit,
      loading,
      target,
      timeSpan,
      compare
    } = this.state
    const amountOrProfit = target === 1 ? '订单' : '收益'
    return (
      <div className="chart">
        <h1>订单统计</h1>

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
              <a
                data-value={1}
                className={target === 1 ? 'padLR on' : 'padLR'}
                onClick={this.changeTarget}
              >
                订单数量
              </a>
              <a
                data-value={2}
                className={target === 2 ? 'on' : ''}
                onClick={this.changeTarget}
              >
                订单收益
              </a>
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
                    ? `${DAY[timeSpan]}热水器${amountOrProfit}`
                    : `热水器${amountOrProfit}`
                }
                dataKey="y"
                label="饮水机"
                stroke="#4aaaef"
                dot={false}
                activeDot={{ strokeWidth: 2 }}
              />
              <Line
                name={
                  compare
                    ? `${DAY[timeSpan]}饮水机${amountOrProfit}`
                    : `饮水机${amountOrProfit}`
                }
                dataKey="water"
                stroke="#97da7b"
                dot={false}
                activeDot={{ strokeWidth: 2 }}
              />
              {compare ? (
                <Line
                  name={
                    compare
                      ? `${LASTDAY[timeSpan]}热水器${amountOrProfit}`
                      : `热水器${amountOrProfit}`
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
                    compare
                      ? `${LASTDAY[timeSpan]}饮水机${amountOrProfit}`
                      : `饮水机${amountOrProfit}`
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
    const { type, payload, label, active, timeUnit } = this.props
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

const CustomizedAxisTick = React.createClass({
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
