import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Table from 'antd/lib/table'
import AjaxHandler from '../../../util/ajax'
import CONSTANTS from '../../component/constants'
import Time from '../../../util/time'
import SearchLine from '../../component/searchLine'
import SchoolSelector from '../../component/schoolSelector'
import BasicSelector from '../../component/basicSelectorWithoutAll'
const NOW = Date.parse(new Date())
/*----------timespan: 1-今日,2-本周,3-本月-----*/

const data03 = []

const initilaState = {
  dataSource: data03,
  timeSpan: '1',
  searchingText: '',
  startTime: Time.getTodayStart(),
  endTime: Time.getNow(),
  totalAmount: 0,
  totalMoney: 0
}

export default class BonusDetail extends Component {
  state = initilaState

  fetchData = body => {
    let resource = '/api/statistics/bonus/rank'
    const cb = json => {
      if (json.error) {
        throw new Error(json.error)
      } else {
        json.data.rows &&
          json.data.rows.map((r, i) => {
            r.ranking = i + 1
          })
        this.setState({
          dataSource: json.data.rows,
          totalAmount: json.data.totalAmount,
          totalMoney: json.data.totalMoney
        })
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }

  componentDidMount() {
    this.props.hide(false)
    const body = {
      startTime: Time.getTodayStart(),
      endTime: Time.getNow(),
      page: 1,
      size: 10000
    }
    this.fetchData(body)
  }
  componentWillUnmount() {
    this.props.hide(true)
  }

  changeTP = v => {
    let nextState = {
      timeSpan: v
    }
    const body = {
      endTime: Time.getNow(),
      page: 1,
      size: 10000
    }
    if (this.state.searchingText) {
      body.schoolName = this.state.searchingText
    }
    let newStartTime
    if (v === '1') {
      //today
      newStartTime = Time.getTodayStart()
    } else if (v === '2') {
      newStartTime = Time.getWeekStart(NOW)
    } else {
      newStartTime = Time.getMonthStart(NOW)
    }
    body.startTime = newStartTime
    this.fetchData(body)
    nextState.endTime = Time.getNow()
    nextState.startTime = newStartTime
    this.setState(nextState)
  }

  changeSearch = e => {
    this.setState({
      searchingText: e.target.value
    })
  }
  pressEnter = () => {
    let { startTime, endTime, searchingText } = this.state
    const body = {
      startTime: startTime,
      endTime: endTime,
      page: 1,
      size: 10000,
      schoolName: searchingText
    }
    this.fetchData(body)
  }

  render() {
    const {
      dataSource,
      timeSpan,
      searchingText,
      totalAmount,
      totalMoney
    } = this.state

    const columns = [
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
    const selector1 = (
      <BasicSelector
        staticOpts={CONSTANTS.TIMESPANS}
        selectedOpt={timeSpan}
        changeOpt={this.changeTP}
      />
    )

    return (
      <div className="disp">
        <div className="contentArea">
          <SearchLine
            searchInputText="学校名称"
            searchingText={this.state.searchingText}
            pressEnter={this.pressEnter}
            changeSearch={this.changeSearch}
            leftDespTitle1="所有学校使用红包总个数:"
            leftDespDetail1={totalAmount}
            leftDespTitle2="所有学校使用红包总金额:"
            leftDespDetail2={totalMoney}
            selector1={selector1}
          />
          <div className="tableList">
            <Table
              bordered
              rowKey={record => record.id}
              pagination={{ defaultPageSize: CONSTANTS.PAGINATION }}
              dataSource={dataSource}
              columns={columns}
            />
          </div>
        </div>
      </div>
    )
  }
}
