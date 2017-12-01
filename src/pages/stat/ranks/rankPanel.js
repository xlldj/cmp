import React, { Component } from 'react'
import {Link } from 'react-router-dom'
import Table from 'antd/lib/table'
import AjaxHandler from '../../ajax'
import CONSTANTS from '../../component/constants'
import Time from '../../component/time'
import SearchLine from '../../component/searchLine'
import SchoolSelector from '../../component/schoolSelector'
import BasicSelector from '../../component/basicSelectorWithoutAll'

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
const TITLES = ['所有学校订单总收益', '所有学校新增用户总数', '所有学校使用红包总个数', '所有学校净收益', '所有学校报修设备总数']
const TITLES2 = ['', '', '所有学校使用红包总金额', '']
const RANK = ['order', 'user', 'bonus', 'funds', 'repair']
const TOTALNAME = ['totalIncome', 'totalNewly', 'totalAmount', 'pureIncome', 'totalAmount']
const TOTAL2NAME = ['', '', 'totalMoney', '', '']
const SIZE = 6

const orderColumns = [{
  title: '排名',
  width: '12%',
  dataIndex: 'ranking',
  className: 'firstCol'
}, {
  title: '学校名称',
  dataIndex: 'schoolName'
}, {
  title: (<p className='center'>热水器订单</p>),
  dataIndex: 'showerAmount',
  width: '12%',
  className: 'center'
}, {
  title: (<p className='center'>饮水机订单</p>),
  dataIndex: 'waterAmount',
  width: '12%',
  className: 'center',
}, {
  title: (<p className='center'>总订单</p>),
  dataIndex: 'totalAmount',
  width: '12%',
  className: 'center'
}, {
  title: (<p className='center'>热水器收益</p>),
  dataIndex: 'showerIncome',
  width: '12%',
  className:'center'
},{
  title: (<p className='center'>饮水机收益</p>),
  dataIndex: 'waterIncome',
  width: '12%',
  className: 'center'
}, {
  title: (<p className='center'>总收益</p>),
  dataIndex: 'totalIncome',
  width: '12%',
  className:'center'
}]

const userColumns = [{
  title: '排名',
  width: '12%',
  dataIndex: 'ranking',
  className: 'firstCol'
}, {
  title: '学校名称',
  dataIndex: 'schoolName'
}, {
  title: (<p className='center'>总用户</p>),
  dataIndex: 'total',
  width: '25%',
  className: 'center'
}, {
  title: (<p className='center'>新增用户</p>),
  dataIndex: 'newly',
  width: '25%',
  className: 'center',
}]

const bonusColumns = [{
  title: '排名',
  width: '12%',
  dataIndex: 'ranking',
  className: 'firstCol'
}, {
  title: '学校名称',
  dataIndex: 'schoolName'
}, {
  title: (<p className='center'>领取红包</p>),
  dataIndex: 'receiveAmount',
  width: '15%',
  className: 'center'
}, {
  title: (<p className='center'>使用红包</p>),
  dataIndex: 'useAmount',
  width: '15%',
  className: 'center',
}, {
  title: (<p className='center'>领取红包总金额</p>),
  dataIndex: 'receiveMoney',
  width: '18%',
  className: 'center'
}, {
  title: (<p className='center'>使用红包总金额</p>),
  dataIndex: 'useMoney',
  width: '18%',
  className: 'center',
}]
const fundsColumns = [{
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
const repairColumns = [{
  title: '排名',
  width: '12%',
  dataIndex: 'ranking',
  className: 'firstCol'
}, {
  title: '学校名称',
  dataIndex: 'schoolName'
}, {
  title: (<p className='center'>热水器报修</p>),
  dataIndex: 'shower',
  width: '22%',
  className: 'center'
}, {
  title: (<p className='center'>饮水机报修</p>),
  dataIndex: 'water',
  width: '22%',
  className: 'center',
}, {
  title: (<p className='center'>总数</p>),
  dataIndex: 'total',
  width: '20%',
  className: 'center',
}]

const initilaState = {
  startTime:Time.getTodayStart(NOW),
  endTime: Time.getNow(),
  dataSource: [],
  timeSpan: 1,
  searchingText: '',
  currentRank: 0,
  titleValue: 0,
  titleValue2: 0,
  loading: false,
  page: 1,
  selectedSchool: 'all', 
  total: 0
};
const COLUMNS = [orderColumns, userColumns, bonusColumns, fundsColumns, repairColumns]

export default class RankPanel extends Component {

  state = initilaState;

  fetchData = (body, index) => {
    this.setState({
      loading: true
    })
    let rank = index
    let resource = `/statistics/${RANK[rank]}/rank`
    const cb = (json)=>{
      let nextState = {loading: false}
      if(json.error){
        throw new Error(json.error)
      }else{
        json.data.rows&&json.data.rows.forEach((r, i) => {
          r.ranking = i + 1
        })
        nextState.dataSource = json.data.rows
        nextState.total = json.data.total
        nextState.titleValue = json.data[TOTALNAME[rank]]
        nextState.titleValue2 = TOTAL2NAME[rank] ? json.data[TOTAL2NAME[rank]] : ''
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource,body,cb)
  }

  componentDidMount(){
    const body={
      startTime: Time.getTodayStart(NOW),
      endTime: Time.getNow(),
      page: 1,
      size: SIZE
    }
    this.fetchData(body, 0)
  }

  changeTimeSpan = (e) => {
    let i = e.target.getAttribute('data-value')
    let v = parseInt(i, 10)
    if (v === this.state.timeSpan) {
      return
    }
    let nextState = {
      timeSpan:  v
    }
    let {selectedSchool, schoolName, currentRank} = this.state
    const body={
      endTime: Time.getNow(),
      page: 1,
      size: SIZE
    }
    if (selectedSchool !== 'all') {
      body.schoolName = schoolName
    }
    let newStartTime
    if(v===1){//today
      newStartTime = Time.getTodayStart(NOW)
    }else if(v===2){
      newStartTime = Time.getWeekStart(NOW)
    }else{
      newStartTime = Time.getMonthStart(NOW)
    }
    body.startTime = newStartTime
    this.fetchData(body, currentRank)

    nextState.page = 1
    nextState.endTime=Time.getNow()
    nextState.startTime=newStartTime
    this.setState(nextState)
  }

  chooseChart = (e) => {
    let i = parseInt(e.target.getAttribute('data-index'), 10)
    let {currentRank} = this.state
    if (i === currentRank) {
      return
    }
    let nextState = {
      currentRank: i,
      page: 1
    }
    let {startTime, endTime, selectedSchool, schoolName} = this.state
    let body = {
      startTime: startTime,
      endTime: endTime,
      page: 1,
      size: SIZE
    }
    if (selectedSchool !== 'all') {
      body.schoolName = schoolName
    }
    this.setState(nextState)
    this.fetchData(body, i)
  }

  changeSchool = (v, name) => {
    let nextState = {selectedSchool: v, page: 1}
    let {currentRank, startTime, endTime} = this.state, body = {}
    body.startTime = startTime
    body.endTime = endTime
    body.page = 1
    body.size = SIZE
    if(v !== 'all'){
      body.schoolName = name
      nextState.schoolName = name
    }
    this.setState(nextState)
    this.fetchData(body, currentRank)
  }
  changePage = (pageObj) => {
    let page = pageObj.current
    let {currentRank, startTime, endTime, selectedSchool, schoolName} = this.state
    this.setState({
      page: page,
      loading: true
    })
    const body ={
      startTime: startTime,
      endTime: endTime,
      page: page,
      size: SIZE
    }
    if (selectedSchool !== 'all') {
      body.schoolName = schoolName
    }
    this.fetchData(body, currentRank)
  }

  render() {
    const { dataSource, timeSpan, titleValue, titleValue2, currentRank, loading, selectedSchool, total, page} = this.state;

    const selector1 = <BasicSelector
                        staticOpts={CONSTANTS.TIMESPANS}
                        selectedOpt={timeSpan}
                        changeOpt={this.changeTP}
                      />

    return (
      <div className='ranksWrapper'>

        <section className='selectBar'>
          <h3>排行榜</h3>

          <div className='selectBox'>
            <SchoolSelector
              selectedSchool={selectedSchool}
              changeSchool={this.changeSchool}
            />
          </div>

          <div className='timespan'>
            <a data-value={1} ref='tp1' className={CLASSNAMES[0][timeSpan]} onClick={this.changeTimeSpan} >本日</a>
            <a data-value={2} ref='tp2' className={CLASSNAMES[1][timeSpan]} onClick={this.changeTimeSpan} >本周</a>
            <a data-value={3} ref='tp3' className={CLASSNAMES[2][timeSpan]} onClick={this.changeTimeSpan} >本月</a> 
          </div>
        </section>

        <ul className='chartSelector' onClick={this.chooseChart} >
          <li data-index={0} className={currentRank === 0 ? 'active' : ''} >
            订单排行榜
            {currentRank === 0 ? <div className='bdbtm'></div> : null}
          </li>
          <li data-index={1} className={currentRank === 1 ? 'active' : ''} >
            用户排行榜
            {currentRank === 1 ? <div className='bdbtm'></div> : null}
          </li>
          <li data-index={2} className={currentRank === 2 ? 'active' : ''} >
            红包使用排行榜
            {currentRank === 2 ? <div className='bdbtm'></div> : null}
          </li>
          <li data-index={3} className={currentRank === 3 ? 'active' : ''} >
            资金排行榜
            {currentRank === 3 ? <div className='bdbtm'></div> : null}
          </li>
          <li data-index={4} className={currentRank === 4 ? 'active' : ''} >
            设备报修排行榜
            {currentRank === 4 ? <div className='bdbtm'></div> : null}
          </li>
        </ul>

        <h3 className='tableTitle'>
          {TITLES[currentRank]}:{titleValue}
          {TITLES2[currentRank] ? <span>{TITLES2[currentRank]}:{titleValue2}</span> : null}
        </h3>

        <div className='table'>
          <Table 
            bordered 
            loading={loading}
            rowKey={(record,index)=>(index)}  
            pagination={{pageSize: SIZE, total: total, current: page}}
            dataSource={dataSource} 
            columns={COLUMNS[currentRank]}
            onChange={this.changePage}
          />
        </div>
      </div>
    );
  }
}
