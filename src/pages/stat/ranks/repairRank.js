import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import AjaxHandler from '../../../util/ajax'
import Time from '../../../util/time'

/*----------timespan: 1-今日，2-本周,3-本月-----*/

const data03 = [
  {
    schoolId: 0,
    schoolName: 'string',
    shower: 0,
    total: 0,
    water: 0
  }
]

const initilaState = {
  data: data03,
  timeSpan: 1
}

export default class RepairRank extends Component {
  state = initilaState

  fetchData = body => {
    let resource = '/api/statistics/repair/rank'
    const cb = json => {
      if (json.error) {
        throw new Error(json.error)
      } else {
        this.setState({
          data: json.data.rows
        })
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }

  componentDidMount() {
    const body = {
      startTime: Time.getTodayStart(),
      endTime: Time.getNow(),
      page: 1,
      size: 6
    }
    this.fetchData(body)
  }

  changeTimeSpan = e => {
    e.preventDefault()
    let v = parseInt(e.target.getAttribute('data-value'), 10)
    let { timeSpan } = this.state
    if (v === timeSpan) {
      return
    }
    const body = {
      endTime: Time.getNow(),
      page: 1,
      size: 6
    }
    let newStartTime
    if (v === 1) {
      //today
      newStartTime = Time.getTodayStart()
    } else if (v === 2) {
      newStartTime = Time.getWeekStart(new Date())
    } else {
      newStartTime = Time.getMonthStart(new Date())
    }
    body.startTime = newStartTime
    this.fetchData(body)

    this.setState({
      timeSpan: v
    })
  }

  render() {
    const { data, timeSpan } = this.state

    const rankItems =
      data &&
      data.map((r, i) => {
        return (
          <li key={i}>
            <p className="width15">{i + 1}</p>
            <p className="width30">{r.schoolName}</p>
            <p className="width20 center">{r.shower}</p>
            <p className="width20 center">{r.water}</p>
            <p className="width15 center">{r.total}</p>
          </li>
        )
      })

    return (
      <div className="rank">
        <div className="header">
          <h1>报修排行榜</h1>
          <Link to="/stat/repairRank">更多</Link>
        </div>

        <div className="rankContent">
          <div className="timeSelectors">
            <a
              className={timeSpan === 1 ? 'active' : ''}
              data-value={1}
              onClick={this.changeTimeSpan}
              href=""
            >
              本日
            </a>
            <a
              className={
                timeSpan === 2
                  ? 'active'
                  : timeSpan === 1 ? 'noLeftBdr' : 'noRightBdr'
              }
              data-value={2}
              onClick={this.changeTimeSpan}
              href=""
            >
              本周
            </a>
            <a
              className={timeSpan === 3 ? 'active' : ''}
              data-value={3}
              onClick={this.changeTimeSpan}
              href=""
            >
              本月
            </a>
          </div>

          <ul>
            <li className="tableHeader">
              <p className="width15">排名</p>
              <p className="width30">学校</p>
              <p className="width20">热水器</p>
              <p className="width20">饮水机</p>
              <p className="width15">总数</p>
            </li>
            {rankItems}
          </ul>
        </div>
      </div>
    )
  }
}
