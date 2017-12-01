import React, { Component } from 'react'
import {Link } from 'react-router-dom'
import Table from 'antd/lib/table'
import AjaxHandler from '../../ajax'
import CONSTANTS from '../../component/constants'
import Time from '../../component/time'
import SearchLine from '../../component/searchLine'
import SchoolSelector from '../../component/schoolSelector'
import BasicSelector from '../../component/basicSelectorWithoutAll'
const NOW =Date.parse(new Date())

/*----------timespan: 1-今日,2-本周,3-本月-----*/

const data03 = [
    ]

const initilaState = {
  dataSource: data03,
  timeSpan: '1',
  searchingText:'',
  startTime:Time.getTodayStart(),
  endTime: Time.getNow(),
  pureIncome: 0
};

export default class FundsDetail extends Component {

  state = initilaState;

  fetchData = (body) => {
    let resource = '/api/statistics/funds/rank'
    const cb = (json)=>{
      if(json.error){
        throw new Error(json.error)
      }else{
        json.data.rows&&json.data.rows.map((r,i)=>{
          r.ranking = i+1
        })
        this.setState({
          dataSource: json.data.rows,
          pureIncome: json.data.pureIncome
        })
      }
    }
    AjaxHandler.ajax(resource,body,cb)
  }

  componentDidMount(){
    this.props.hide(false)
    const body={
      startTime: Time.getTodayStart(),
      endTime: Time.getNow(),
      page: 1,
      size:10000
    }
    this.fetchData(body)
  }
  componentWillUnmount () {
    this.props.hide(true)
  }

  changeTP = (v)=>{
    let nextState={
      timeSpan:  v
    }
    const body={
      endTime: Time.getNow(),
      page: 1,
      size:10000
    }
    if(this.state.searchingText){
      body.schoolName=this.state.searchingText
    }
    let newStartTime
    if(v==='1'){//today
      newStartTime = Time.getTodayStart()
    }else if(v==='2'){
      newStartTime = Time.getWeekStart(NOW)
    }else{
      newStartTime = Time.getMonthStart(NOW)
    }
    body.startTime = newStartTime
    this.fetchData(body)
    nextState.endTime=Time.getNow()
    nextState.startTime=newStartTime
    this.setState(nextState)
  }

  changeSearch = (e) => {
    this.setState({
      searchingText: e.target.value
    })
  }
  pressEnter = () => {
    let {startTime,endTime,searchingText} = this.state
    const body = {
      startTime: startTime,
      endTime: endTime,
      page: 1,
      size:10000,
      schoolName: searchingText
    }
    this.fetchData(body)
  }

  render() {
    const { dataSource,timeSpan,pureIncome } = this.state;

    const columns = [{
      title: '排名',
      width: '12%',
      dataIndex: 'ranking',
      className: 'firstCol'
    }, {
      title: '学校名称',
      dataIndex: 'schoolName'
    }, {
      title: (<p className='center'>充值订单</p>),
      dataIndex: 'rechargeAmount',
      width: ',12%',
      className: 'center'
    }, {
      title: (<p className='center'>提现订单</p>),
      dataIndex: 'withdrawAmount',
      width: ',12%',
      className: 'center',
    }, {
      title: (<p className='center'>总订单</p>),
      dataIndex: 'totalAmount',
      width: ',12%',
      className: 'center'
    }, {
      title: (<p className='center'>充值金额</p>),
      dataIndex: 'rechargeMoney',
      width: ',12%',
      className: 'center',
    }, {
      title: (<p className='center'>提现金额</p>),
      dataIndex: 'withdrawMoney',
      width: ',12%',
      className: 'center',
    }, {
      title: (<p className='center'>净收益</p>),
      dataIndex: 'totalMoney',
      width: ',12%',
      className: 'center'
    }]
    const selector1 = <BasicSelector
                        staticOpts={CONSTANTS.TIMESPANS}
                        selectedOpt={timeSpan}
                        changeOpt={this.changeTP}
                      />

    return (
      <div className='disp'>
        <div className='contentArea'>
          <SearchLine 
            searchInputText='学校名称'  
            searchingText={this.state.searchingText}  
            pressEnter={this.pressEnter} 
            changeSearch={this.changeSearch} 
            leftDespTitle1='所有学校净收益:' 
            leftDespDetail1={pureIncome} 
            selector1={selector1}
          />
          <div className='tableList'>
            <Table bordered rowKey={(record)=>(record.id)}  pagination={{defaultPageSize:CONSTANTS.PAGINATION}}  dataSource={dataSource} columns={columns} />
          </div>
        </div>
      </div>
    );
  }
}
