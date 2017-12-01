import React, { Component } from 'react'
import {Link } from 'react-router-dom'
import {Icon } from 'antd'
import AjaxHandler from '../../ajax'
import CONSTANTS from '../../component/constants'
import Time from '../../component/time'

/*----------timespan: 1-今日，2-本周,3-本月-----*/

const data03 = [
          {
            'schoolId': 0,
            'schoolName': 'string',
            'showerAmount': 0,
            'showerIncome': 0,
            'totalAmount': 0,
            'totalIncome': 0,
            'waterAmount': 0,
            'waterIncome': 0
          }
        ]

const initilaState = {
  data: data03,
  loading: false
};

export default class Rank extends Component {

  state = initilaState;

  fetchData = (body) => {
    this.setState({
      loading: true
    })
    let resource = '/api/statistics/order/rank'
    const cb = (json)=>{
      let nextState = {loading: false}
      if(json.error){
        throw new Error(json.error)
      }else{
        nextState.data = json.data.rows
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource,body,cb)
  }

  componentDidMount(){
    const body={
      startTime: Time.getTodayStart(),
      endTime: Time.getNow(),
      page: 1,
      size:6
    }
    this.fetchData(body)
  }

  componentWillReceiveProps (nextProps) {
    let nextState = {}, body = {}
    let {startTime, endTime} = this.state
    if (nextProps.startTime !== startTime || nextProps.endTime !== endTime) {
      nextState.startTime = nextProps.startTime
      nextState.endTime = nextProps.endTime

      body.startTime = nextProps.startTime
      body.endTime = nextProps.endTime
      body.page = 1
      body.size = 6
      this.fetchData(body)
      this.setState(nextState)
    }
  }

  render() {
    const { data, loading } = this.state;

    const rankItems = data&&data.map((r,i)=>{
      return (
        <li key={i}>
          <p className='width15'>{i+1}</p>
          <p className='width30'>{r.schoolName}</p>
          <p className='width20 center'>{r.showerAmount}</p>
          <p className='width20 center'>{r.waterAmount}</p>
          <p className='width15 center'>{r.totalIncome}</p>
        </li>
      )
    })

    return (
      <div className='rank'>
        <div className='header'>
          <h1>订单排行榜</h1>
          <Link to='/stat/orderRank' >更多</Link>
        </div>

        <div className='rankContent'>

          <div className={loading?'loadingWrapper show':'loadingWrapper hide'}>
            <span><Icon type='loading' /></span>加载中...
          </div>

          <ul>
            <li className='tableHeader'>
              <p className='width15'>排名</p>
              <p className='width30'>学校</p>
              <p className='width20'>热水器订单</p>
              <p className='width20'>饮水机订单</p>
              <p className='width15'>总收益</p>
            </li>
            {rankItems}
          </ul>
        </div>
      </div>
    );
  }
}
