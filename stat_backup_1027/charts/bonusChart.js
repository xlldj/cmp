import React, { Component } from 'react';
import LineChart from 'recharts/lib/chart/LineChart'
import Line from 'recharts/lib/cartesian/Line'
import XAxis from 'recharts/lib/cartesian/XAxis'
import YAxis from 'recharts/lib/cartesian/YAxis'
import Tooltip from 'recharts/lib/component/Tooltip'
import CartesianGrid from 'recharts/lib/cartesian/CartesianGrid'
import Legend from 'recharts/lib/component/Legend'
import Label from 'recharts/lib/component/Label'
import LabelList from 'recharts/lib/component/LabelList'
import { scalePow, scaleLog } from 'd3-scale';
import SchoolSelector from '../../component/schoolSelector'
import Select from 'antd/lib/select'
import Switch from 'antd/lib/switch'
import Icon from 'antd/lib/icon'
import DatePicker from 'antd/lib/date-picker'
import AjaxHandler from '../../ajax'
import Format from '../../component/format'
import CONSTANTS from '../../component/constants'
import Time from '../../component/time'
import Noti from '../../noti'
import moment from 'moment'
const {RangePicker} = DatePicker

const NOW = Date.parse(new Date())
const DAY = {
  1:'本日',
  2:'本周',
  3:'本月'
}
const LASTDAY = {
  1:'昨日',
  2:'上周',
  3:'上月'
}
/*----------timeUnit:1-hour,2-day------------*/
/*----------target:1-红包数量，2-红包金额--------*/
/*----------timespan: 1-今日，2-本周,3-本月-----*/

const data03 = [
        ]

const initilaState = {
  data: data03,
  loading: false,
  selectedSchool: 'all',
  target: 1,
  timeUnit: 2,
  startTime: Time.getWeekStart(NOW),
  endTime: Time.getWeekEnd(NOW),
  compare: false,
  compareLock: false,
  compareNeed: false,
  timeSpan: 2
};

export default class BonusChart extends Component {

  state = initilaState;

  fetchData = (body) => {
    let resource = '/api/statistics/bonus/polyline'
    const cb = (json)=>{
      let nextState = {
        loading: false
      }
      if(json.error){
        throw new Error(json.error)
      }else{
        let receivePoints = json.data.receivePoints, usePoints = json.data.usePoints
        let {startTime,endTime,timeUnit} = this.state,data
        if(timeUnit===2){
          data =Time.getDateArray(startTime,endTime)
          data.map((r,i)=>{
            let t = Date.parse(new Date(r.x))
            if(t<NOW){
              r.y = 0
              r.use = 0
            }
          })
          receivePoints&&receivePoints.map((r,i)=>{
            let x = Format.dayFormat(r.x)
            let xInData = data.find((r,i)=>(r.x===x))
            if(xInData){
              xInData.y = r.y//push shower points into data array
            }
          })
          usePoints&&usePoints.map((r,i)=>{
            let x = Format.dayFormat(r.x)
            let xInData = data.find((r,i)=>(r.x===x))
            if(xInData){
              xInData.use = r.y//push shower points into data array
            }
          })
        }else{
          data = Time.getHourArray(startTime,endTime)
          data.map((r,i)=>{
            let t = Date.parse(new Date(r.x))
            if(t<NOW){
              r.y = 0
              r.use= 0
            }
          })
          receivePoints&&receivePoints.map((r,i)=>{
            let x = Format.hourFormat(r.x)
            let xInData = data.find((r,i)=>(r.x===x))
            if(xInData){
              xInData.y = r.y//push shower points into data array
            }
          })
          usePoints&&usePoints.map((r,i)=>{
            let x = Format.hourFormat(r.x)
            let xInData = data.find((r,i)=>(r.x===x))
            if(xInData){
              xInData.use = r.y//push shower points into data array
            }
          })
        }
        nextState.data = data
      }
      if(this.state.compare&&this.state.compareNeed){
        this.fetchCompareData()
        nextState.loading = true
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource,body,cb)
  }

  componentDidMount(){
    const body={
      "endTime": Time.getWeekEnd(NOW),
      "startTime": Time.getWeekStart(NOW),
      "target": 1,
      "timeUnit": 2
    }
    this.fetchData(body)
  }

  changeSchool = (v) => {
    let {startTime,endTime,target,timeUnit,selectedSchool,compare} = this.state
    let nextState = {
      selectedSchool: v,
      loading: true
    }
    const body = {
      startTime: startTime,
      endTime: endTime,
      timeUnit: timeUnit,
      target: target,
    }
    if(v!=='all'){
      body.schoolId = parseInt(v)
    }
    if(compare){
      nextState.compareNeed=true
    }
    this.setState(nextState)
    this.fetchData(body)
  }

  changeTarget = (e) => {
    e.preventDefault()
    let v = parseInt(e.target.getAttribute('data-value'))
    let {target,startTime,endTime,timeUnit,selectedSchool,compare} = this.state
    if(v===target){
      return
    }
    const body = {
      startTime: startTime,
      endTime: endTime,
      timeUnit: timeUnit,
      target: target
    }
    if(selectedSchool!=='all'){
      body.schoolId = parseInt(selectedSchool)
    }
    this.fetchData(body)

    let nextState = {
      target: v,
      loading: true
    }
    if(compare){
      nextState.compareNeed=true
    }
    this.setState(nextState)
  }

  fetchCompareData = () => {
    this.setState({
      compareNeed: false
    })
    let {target,timeUnit,selectedSchool,timeSpan} = this.state
    let newStartTime,newEndTime  /*----------------------------------------------*/
    if(timeSpan===1){
      newStartTime = Time.getYestodayStart()
      newEndTime = Time.getYestodayEnd()
    }else if(timeSpan===2){
      newStartTime = Time.getLastWeekStart()
      newEndTime = Time.getLastWeekEnd()
    }else if(timeSpan===3){
      newStartTime = Time.getLastMonthStart()
      newEndTime = Time.getLastMonthEnd()
    }else{
      return Noti.hintLock('当前状态下不能比较！','请选择本日/本周/本月后再进行比较')
    }
    let resource = '/api/statistics/bonus/polyline'
    const body = {
      startTime: newStartTime,
      endTime: newEndTime,
      target: target,
      timeUnit: timeUnit
    }
    if(selectedSchool!=='all'){
      body.schoolId = parseInt(selectedSchool)
    }
    const cb = (json)=>{
      let nextState = {
        loading: false
      }
      if(json.error){
        throw new Error(json.error)
      }else{
        let receivePoints = json.data.receivePoints, usePoints = json.data.usePoints, newData = JSON.parse(JSON.stringify(this.state.data)),timeSpan=this.state.timeSpan
        if(timeSpan===1){
          newData.map((r,i)=>{
            r.lastReceive= 0
            r.lastUse =0
            let lastX = Time.ago24Hour(r.x)//取得24小时之前的时间
            r.lastX = lastX
          })
          receivePoints&&receivePoints.map((r,i)=>{
            let item = newData.find((record,ind)=>(Format.hourFormat(r.x)===record.lastX))
            if(item){
              item.lastReceive = r.y
            }
          })
          usePoints&&usePoints.map((r,i)=>{
            let item = newData.find((record,ind)=>(Format.hourFormat(r.x)===record.lastX))
            if(item){
              item.lastUse = r.y
            }
          })
        }else if(timeSpan===2){
          newData.map((r,i)=>{
            r.lastReceive = 0
            r.lastUse =0
            let lastX = Time.ago1Week(r.x)//取得24小时之前的时间
            r.lastX = lastX
          })
          receivePoints&&receivePoints.map((r,i)=>{
            let item = newData.find((record,ind)=>(record.lastX===Format.dayFormat(r.x)))
            if(item){
              item.lastReceive = r.y
            }
          })
          usePoints&&usePoints.map((r,i)=>{
            let item = newData.find((record,ind)=>(record.lastX===Format.dayFormat(r.x)))
            if(item){
              item.lastUse= r.y
            }
          })
        }else{
          let lastMonthArray = Time.getDateArray(Time.getLastMonthStart(),Time.getLastMonthEnd())
          lastMonthArray.map((r,i)=>{
            if(i<newData.length){
              newData[i].lastReceive = 0
              newData[i].lastUse=0
              newData[i].lastX = r.x
            }else{
              newData.push({
                lastX:r.x,
                lastReceive: 0,
                lastUse:0
              })
            }
          })
          receivePoints&&receivePoints.map((r,i)=>{
            let item = newData.find((record,ind)=>(record.lastX===Format.dayFormat(r.x)))
            if(item){
              item.lastReceive= r.y
            }
          })
          usePoints&&usePoints.map((r,i)=>{
            let item = newData.find((record,ind)=>(record.lastX===Format.dayFormat(r.x)))
            if(item){
              item.lastUse= r.y
            }
          })
        }
        nextState.data= newData
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource,body,cb)
  }

  removeCompareData = () => {
    /*-----------后续查看是否需要重新拉取数据，因为可能比较两月时，当前月的数据比上月少，删除上月后当前数据中有无效长度，重新拉取会呈现地更好-------------*/
    let {data,compare} = this.state, newData = JSON.parse(JSON.stringify(data))
    newData&&newData.map((r,i)=>{
      delete r.lastReceive
      delete r.lastUse
    })
    this.setState({
      data: newData,
      compare: false
    })
  }

  compareLast=(checked)=>{
    if(this.state.compareLock){
      return Noti.hintLock('当前状态下不能比较！','请选择本日/本周/本月后再进行比较')
    }
    let nextState = {
      compare: checked
    }
    if(checked){
      this.fetchCompareData()
      nextState.compareNeed = true
    }else{
      this.removeCompareData()
      nextState.compareNeed=false
    }
    this.setState(nextState)
  }

  changeTimeSpan = (e) => {
    /*-----------if compared,clean it-----------*/
    e.preventDefault()
    let v = parseInt(e.target.getAttribute('data-value'))
    let {target,startTime,endTime,timeUnit,selectedSchool,timeSpan,compare} = this.state
    if(v===timeSpan){
      return
    }
    const body = {
      target: target
    }
    if(selectedSchool!=='all'){
      body.schoolId = parseInt(selectedSchool)
    }
    /*--------start and end---------*/
    let newStartTime,newEndTime
    let nextState={
      timeSpan: v,
      loading: true,
      compareLock: false
    }
    if(v===1){//today
      newStartTime = Time.getDayStart(NOW)
      newEndTime = Time.getDayEnd(NOW)
      nextState.timeUnit = 1
      body.timeUnit = 1
    }else if(v===2){
      newStartTime = Time.getWeekStart(NOW)
      newEndTime = Time.getWeekEnd(NOW)
      nextState.timeUnit = 2
      body.timeUnit=2
    }else{
      newStartTime = Time.getMonthStart(NOW)
      newEndTime = Time.getMonthEnd(NOW)
      nextState.timeUnit = 2
      body.timeUnit =2
    }
    body.startTime = newStartTime
    body.endTime = newEndTime
    this.fetchData(body)

    nextState.startTime = newStartTime
    nextState.endTime = newEndTime
    if(compare){
      nextState.compareNeed = true
    }
    this.setState(nextState)
  } 

  selectRange = (dates,dateStrings)=>{
    /*-----------------后续需要检查选择的时间间隔大小来确定timeunit----------------*/
    let newStartTime= Time.getDayStart(dateStrings[0]),newEndTime = Time.getDayEnd(dateStrings[1])
    let {target,startTime,endTime,timeUnit,selectedSchool,timeSpan} = this.state
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
      target: target,
      startTime: newStartTime,
      endTime: newEndTime
    }
    if(selectedSchool!=='all'){
      body.schoolId = parseInt(selectedSchool)
    }
    this.fetchData(body)
    this.setState(nextState)
  }

  render() {
    const { data, selectedSchool,startTime,endTime, timeUnit,loading,target,timeSpan,compare } = this.state;
    const amountOrProfit = target===1?'数量':'金额'
    return (
      <div className='chart'>
        <h1>
          红包使用统计
        </h1>

        <div >
          <div className={loading?'loadingWrapper show':'loadingWrapper hide'}>
            <span><Icon type='loading' /></span>加载中...
          </div>

          <div className='query'>
            <div>
              <SchoolSelector className='padR' width={CONSTANTS.SHORTSELECTOR} selectedSchool={selectedSchool} changeSchool={this.changeSchool} />
              <a data-value={1} className={target===1?'padLR on':'padLR'} onClick={this.changeTarget}>红包数量</a>
              <a data-value={2} className={target===2?'on':''} onClick={this.changeTarget}>红包金额</a>
            </div> 
            <div>
              <span className='compare'>对比{LASTDAY[timeSpan]}</span>
              <Switch checked={compare} size='small' onChange={this.compareLast} />
            </div>
            <div>
              <a data-value={1} className={timeSpan===1?'padR on':'padR'} onClick={this.changeTimeSpan} >本日</a>
              <a data-value={2} className={timeSpan===2?'padR on':'padR'} onClick={this.changeTimeSpan} >本周</a>
              <a data-value={3} className={timeSpan===3?'padR on':'padR'} onClick={this.changeTimeSpan} >本月</a> 
              <RangePicker allowClear={false} className='rangePicker' value={[moment(Time.getDayFormat(startTime)),moment(Time.getDayFormat(endTime))]} onChange={this.selectRange} />
            </div>
          </div>

          <div className="lineChartWrapper">
            <LineChart
              width={CONSTANTS.CHARTWIDTH} height={CONSTANTS.CHARTHEIGHT} data={data}
              margin={{ top: 10, right: 20, bottom: 0, left: 0 }}
            >
              <CartesianGrid vertical={false} horizontal={false} />
              <XAxis axisLine={{stroke:'#ddd'}} name='date' dataKey="x" tick={<CustomizedXAxisTick timeUnit={timeUnit} />} tickLine={false}/>
              <YAxis axisLine={{stroke:'#ddd'}} domain={['auto', 'auto']} tickLine={false} tick={<CustomizedAxisTick />} />
              <Tooltip isAnimationActive={false} cursor={{ stroke: '#222', strokeWidth: 1 }} content={<CustomizedTooltip timeUnit={timeUnit} />}  />
              <Legend align='left' verticalAlign="top" iconType='line' margin={{left:-20}} wrapperStyle={{paddingLeft:20,top:-15}} width={300} height={36}  />
              <Line name={compare?`${DAY[timeSpan]}领取${amountOrProfit}`:`领取${amountOrProfit}`} dataKey="y" stroke="#4aaaef" dot={false} activeDot={{strokeWidth: 2}} />
              <Line name={compare?`${DAY[timeSpan]}使用${amountOrProfit}`:`使用${amountOrProfit}`} dataKey='use' stroke='#97da7b' dot={false} activeDot={{strokeWidth: 2}} />
              {compare?<Line name={compare?`${LASTDAY[timeSpan]}领取${amountOrProfit}`:`领取${amountOrProfit}`} dataKey='lastReceive' stroke='#ffa312' dot={false} activeDot={{strokeWidth: 2}} />:null}
              {compare?<Line name={compare?`${LASTDAY[timeSpan]}使用${amountOrProfit}`:`使用${amountOrProfit}`} dataKey='lastUse' stroke='#ff5555' dot={false} activeDot={{strokeWidth: 2}} />:null}
            </LineChart>
          </div>
        </div>
      </div>
    );
  }
}

const CustomizedTooltip = React.createClass({
  render () {
    const {type, payload, label, active,timeUnit} = this.props;
    const ys = !!payload&&payload.filter((r,i)=>{
      return r.dataKey === 'y'
    })
    const yItems = !!ys&&ys.map((r,i)=>{
        if(r.payload.x){
          return (
              <li key={i}>
                <svg key={`svg${i}`} className='lineIcon' >
                  <line x1="0" x2="5" y1={5} y2={5} stroke={r.stroke} />
                  <circle cx="7" cy={5} r="2" stroke={r.stroke} fill="transparent" />
                  <line x1="9" x2="14" y1={5} y2={5} stroke={r.stroke} fill="transparent" />
                </svg>
                <span key={`span${i}`} className='name'>{r.name}</span>
                <span key={`span2${i}`}>{r.value}</span>
              </li>
          )
        }
      }
    )

    const waters = !!payload&&payload.filter((r,i)=>{
      return r.dataKey === 'use'
    })
    const waterItems = !!waters&&waters.map((r,i)=>{
        if(r.payload.x){
          return (
              <li key={i}>
                <svg key={`svg${i}`} className='lineIcon' >
                  <line x1="0" x2="5" y1={5} y2={5} stroke={r.stroke} />
                  <circle cx="7" cy={5} r="2" stroke={r.stroke} fill="transparent" />
                  <line x1="9" x2="14" y1={5} y2={5} stroke={r.stroke} fill="transparent" />
                </svg>
                <span key={`span${i}`} className='name'>{r.name}</span>
                <span key={`span2${i}`}>{r.value}</span>
              </li>
          )
        }
      }
    )

    const lastShowers = !!payload&&payload.filter((r,i)=>{
      return r.dataKey === 'lastReceive'
    })
    const lastShowerItems = !!lastShowers&&lastShowers.map((r,i)=>{
          return (
              <li key={i}>
                <svg key={`svg${i}`} className='lineIcon' >
                  <line x1="0" x2="5" y1={5} y2={5} stroke={r.stroke} />
                  <circle cx="7" cy={5} r="2" stroke={r.stroke} fill="transparent" />
                  <line x1="9" x2="14" y1={5} y2={5} stroke={r.stroke} fill="transparent" />
                </svg>
                <span key={`span${i}`} className='name'>{r.name}</span>
                <span key={`span2${i}`}>{r.value}</span>
              </li>
          )
      }
    )

    const lastWaters = !!payload&&payload.filter((r,i)=>{
      return r.dataKey === 'lastUse'
    })
    const lastWaterItems = !!lastWaters&&lastWaters.map((r,i)=>{
        return (
            <li key={i}>
              <svg key={`svg${i}`} className='lineIcon' >
                <line x1="0" x2="5" y1={5} y2={5} stroke={r.stroke} />
                <circle cx="7" cy={5} r="2" stroke={r.stroke} fill="transparent" />
                <line x1="9" x2="14" y1={5} y2={5} stroke={r.stroke} fill="transparent" />
              </svg>
              <span key={`span${i}`} className='name'>{r.name}</span>
              <span key={`span2${i}`}>{r.value}</span>
            </li>
        )
      }
    )

    if(active){
      return (
        <div className='tooltip'>
          <ul>
            {label?(<li className='label'>{label}</li>):null}
            {!!ys?yItems:null}
            {!!waters?waterItems:null}
            {!!lastShowers.length?(<li className='label'>{lastShowers[0].payload.lastX}</li>):null}
            {!!lastShowers.length?lastShowerItems:null}
            {!!lastWaters.length?lastWaterItems:null}
          </ul>
        </div>
      )
    }else{
      return null
    }
  }
});

const CustomizedXAxisTick = React.createClass({
  render () {
    const {x, y, stroke, payload,timeUnit} = this.props;
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="end" fill="#999" transform="rotate(-35)">{timeUnit===2?Format.dayLabel(payload.value):Format.hourLabel(payload.value)}</text>
      </g>
    );
  }
});

const CustomizedAxisTick = React.createClass({
  render () {
    const {x, y, stroke, payload} = this.props;
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={0} textAnchor="end" fill="#999">{payload.value}</text>
      </g>
    );
  }
});
