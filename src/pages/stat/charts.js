import React, { Component } from 'react';
import { LineChart, Line, XAxis, YAxis,Tooltip, CartesianGrid, Legend, AreaChart, Area } from 'recharts';
import SchoolSelector from '../component/schoolSelector'
import Switch from 'antd/lib/switch'
import DatePicker from 'antd/lib/date-picker'
import AjaxHandler from '../ajax'
import Format from '../component/format'
import CONSTANTS from '../component/constants'
import Time from '../component/time'
import Noti from '../noti'
import moment from 'moment'
const {MonthPicker} = DatePicker

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
const CHARTTYPES = CONSTANTS.CHARTTYPES
const data1Name = {
  1: 'showerPoints',
  2: 'newlyPoints',
  3: 'receivePoints',
  4: 'rechargePoints',
  5: 'showerPoints'
}
const data2Name = {
  1: 'waterPoints',
  3: 'usePoints',
  4: 'withdrawPoints',
  5: 'waterPoints'
}
const data1label = {
  1: '订单数量',
  2: '',
  3: '红包数量',
  4: '订单数量',
  5: ''
}
const data2label = {
  1: '订单收益',
  3: '红包金额',
  4: '订单收益'
}
const LEGEND = {
  order: {
    1: ['热水器订单', '饮水机订单'],
    2: ['热水器收益', '饮水机收益']
  },
  user: {
    1: ['新增用户']
  },
  bonus: {
    1: ['领取数量', '使用数量'],
    2: ['领取金额', '使用金额']
  },
  funds: {
    1: ['充值订单', '提现订单'],
    2: ['充值收益', '提现收益']
  },
  repair: {
    1: ['热水器报修', '饮水机报修']
  }
}
const AREATIMEUNIT = 3
const CURMONTHSTR = Time.getMonthFormat(NOW)
/*----------timeUnit:1-hour,2-day------------*/
/*----------target: 切换图表内的分支-----------*/
/*----------timespan: 1-今日，2-本周,3-本月-----*/
/*----------compare: 对比flag-----------------*/

const initilaState = {
  data: [],
  loading: false,
  selectedSchool: 'all',
  target: 1,
  timeUnit: 2,
  startTime: Time.getWeekStart(NOW),
  endTime: Time.getWeekEnd(NOW),
  compare: false,
  timeSpan: 2,
  currentChart: 1,
  currentMonth: true, 
  monthStr: '',
  areaData: [],
  areaStartTime: Time.getFirstWeekStart(Time.getMonthStart(NOW))
}

export default class Charts extends Component {

  state = initilaState;

  fetchData = (body, newState) => {
    this.setState({
      loading: true
    })
    /* in case: 1. change chart index, 2. change target. The state won't change immediately when fetchDate, so need to pass newState through parameters */
    let {currentChart, target, startTime, endTime, timeUnit, compare} = {...this.state, ...newState}
    let resource = `/statistics/${CHARTTYPES[currentChart]}/polyline`
    const cb = (json)=>{
      let nextState = {
        loading: false
      }
      if (json.error) {
        Noti.hintServiceError(json.error.displayMessage)
      } else {
        let firstPoints = json.data[data1Name[currentChart]], secondPoints = json.data[data2Name[currentChart]] || null
        /* change the denomination when the result is about money */
        if (target === 2) {
          if (currentChart === 1 || currentChart === 3 || currentChart === 4) {
            firstPoints.forEach((f, i, arr) => {
              arr[i].y = parseInt(f.y / 100, 10)
            })
            secondPoints.forEach((s, i, arr) => {
              arr[i].y = parseInt(s.y / 100, 10)
            })
          }
        }
        let data
        if (timeUnit===2) {
          data =Time.getDateArray(startTime,endTime)
          data.forEach((r,i)=>{
            let t = Date.parse(new Date(r.x))
            if(t<NOW){
              r.y = 0
              r.y2 = 0
            }
          })
          firstPoints&&firstPoints.forEach((r,i)=>{
            let x = Format.dayFormat(r.x)
            let xInData = data.find((r,i)=>(r.x===x))
            if(xInData){
              xInData.y = r.y//push first array data into data array
            }
          })
          secondPoints&&secondPoints.forEach((r,i)=>{
            let x = Format.dayFormat(r.x)
            let xInData = data.find((r,i)=>(r.x===x))
            if(xInData){
              xInData.y2 = r.y//push second array data into data array
            }
          })
        } else {
          data = Time.getHourArray(startTime,endTime)
          data.forEach((r,i)=>{
            let t = Date.parse(new Date(r.x))
            if(t<NOW){
              r.y = 0
              r.y2 = 0
            }
          })
          firstPoints&&firstPoints.forEach((r,i)=>{
            let x = Format.hourFormat(r.x)
            let xInData = data.find((r,i)=>(r.x===x))
            if(xInData){
              xInData.y = r.y//push shower points into data array
            }
          })
          secondPoints&&secondPoints.forEach((r,i)=>{
            let x = Format.hourFormat(r.x)
            let xInData = data.find((r,i)=>(r.x===x))
            if(xInData){
              xInData.y2 = r.y//push shower points into data array
            }
          })
        }
        nextState.data = data
      }
      if(compare){
        this.fetchCompareData()
        nextState.loading = true
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource,body,cb)
  }

  fetchAreaData = (body) => {
    let resource = '/api/statistics/repair/time/polyline'
    const cb = (json)=>{
      let nextState = {
        loading: false
      }
      if(json.error){
        throw new Error(json.error)
      }else{
        let {acceptTime,assignTime,repairTime}= json.data,data=[]
        let {areaStartTime}=this.state
        //starttime是第一个周一的0点，用它减去该年第一天0点，除以7*24*3600*1000，就得到了中间有多少周

        let startWeekNum = Time.getFirstWeekNum(areaStartTime)
        for(let i=0;i<4;i++){
          let monday = areaStartTime + i*7*24*3600*1000
          let item={
            x:`第${i+1}周`,
            num:startWeekNum+i
          }
          //如果周一的0点已经过去，就将所有的值置为0
          if(monday<NOW){
            item.assign= 0
            item.repair=0
            item.y=0
          }
          data.push(item)
        }
        acceptTime&&acceptTime.forEach((r,i)=>{
          let item = data.find((record,ind)=>(record.num===Format.getWeekNum(r.x)))
          if (item) {
            item.y = r.y
          }
        })
        assignTime&&assignTime.forEach((r,i)=>{
          let item = data.find((record,ind)=>(record.num===Format.getWeekNum(r.x)))
          if (item) {
            item.assign = r.y
          }
        })
        repairTime&&repairTime.forEach((r,i)=>{
          let item = data.find((record,ind)=>(record.num===Format.getWeekNum(r.x)))
          if (item) {
            item.repair = r.y
          }
        })
        nextState.areaData = data
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

  changeTarget = (e) => {
    e.preventDefault()
    let v = parseInt(e.target.getAttribute('data-value'), 10)
    let {target,startTime,endTime,timeUnit,selectedSchool} = this.state
    if(v===target){
      return
    }
    const body = {
      startTime: startTime,
      endTime: endTime,
      timeUnit: timeUnit,
      target: v
    }
    if(selectedSchool!=='all'){
      body.schoolId = parseInt(selectedSchool, 10)
    }
    this.fetchData(body, {target: v})

    let nextState = {
      target: v
    }
    this.setState(nextState)
  }

  fetchCompareData = () => {
    this.setState({
      loading: true
    })
    let {target,timeUnit,selectedSchool,timeSpan, currentChart} = this.state
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
    let resource = `/statistics/${CHARTTYPES[currentChart]}/polyline`
    const body = {
      startTime: newStartTime,
      endTime: newEndTime,
      target: target,
      timeUnit: timeUnit
    }
    if(selectedSchool!=='all'){
      body.schoolId = parseInt(selectedSchool, 10)
    }
    const cb = (json)=>{
      let nextState = {
        loading: false
      }
      if(json.error){
        throw new Error(json.error)
      }else{
        let firstPoints = json.data[data1Name[currentChart]], secondPoints = data2Name[currentChart]&&json.data[data2Name[currentChart]]
        if (target === 2) {
          if (currentChart === 1 || currentChart === 3 || currentChart === 4) {
            firstPoints.forEach((f, i, arr) => {
              arr[i].y = parseInt(f.y / 100, 10)
            })
            secondPoints.forEach((s, i, arr) => {
              arr[i].y = parseInt(s.y / 100, 10)
            })
          }
        }

        let newData = JSON.parse(JSON.stringify(this.state.data)),timeSpan=this.state.timeSpan


        //将过去的数据转为本日/周/月的数据，再将其插入data数组中
        if(timeSpan===1){
          newData.forEach((r,i)=>{
            r.lasty = 0
            r.lasty2 =0
            let lastX = Time.ago24Hour(r.x)//取得24小时之前的时间
            r.lastX = lastX
          })
          firstPoints&&firstPoints.forEach((r,i)=>{
            let item = newData.find((record,ind)=>(Format.hourFormat(r.x)===record.lastX))
            if(item){
              item.lasty = r.y
            }
          })
          secondPoints&&secondPoints.forEach((r,i)=>{
            let item = newData.find((record,ind)=>(Format.hourFormat(r.x)===record.lastX))
            if(item){
              item.lasty2 = r.y
            }
          })
        }else if(timeSpan===2){
          newData.forEach((r,i)=>{
            r.lasty = 0
            r.lasty2 =0
            let lastX = Time.weekAgo(r.x)//取得24小时之前的时间
            r.lastX = lastX
          })
          firstPoints&&firstPoints.forEach((r,i)=>{
            let item = newData.find((record,ind)=>(record.lastX===Format.dayFormat(r.x)))
            if(item){
              item.lasty = r.y
            }
          })
          secondPoints&&secondPoints.forEach((r,i)=>{
            let item = newData.find((record,ind)=>(record.lastX===Format.dayFormat(r.x)))
            if(item){
              item.lasty2 = r.y
            }
          })
        }else{
          let lastMonthArray = Time.getDateArray(Time.getLastMonthStart(),Time.getLastMonthEnd())
          lastMonthArray.forEach((r,i)=>{
            if(i<newData.length){
              newData[i].lasty = 0
              newData[i].lasty2 =0
              newData[i].lastX = r.x
            }else{
              newData.push({
                lastX:r.x,
                lasty : 0,
                lasty2 :0
              })
            }
          })
          firstPoints&&firstPoints.forEach((r,i)=>{
            let item = newData.find((record,ind)=>(record.lastX===Format.dayFormat(r.x)))
            if(item){
              item.lasty = r.y
            }
          })
          secondPoints&&secondPoints.forEach((r,i)=>{
            let item = newData.find((record,ind)=>(record.lastX===Format.dayFormat(r.x)))
            if(item){
              item.lasty2 = r.y
            }
          })
        }
        nextState.data = newData
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource,body,cb)
  }

  removeCompareData = () => {
    /*-----------后续查看是否需要重新拉取数据，因为可能比较两月时，当前月的数据比上月少，删除上月后当前数据中有无效长度，重新拉取会呈现地更好-------------*/
    let {data} = this.state, newData = JSON.parse(JSON.stringify(data))
    newData&&newData.forEach((r,i)=>{
      delete r.lasty
      delete r.lasty2
    })
    this.setState({
      data: newData
    })
  }

  chooseChart = (e) => {
    let i = parseInt(e.target.getAttribute('data-index'), 10)
    let {currentChart} = this.state
    if (i === currentChart) {
      return
    }
    if (i) {
      let nextState = {
        nextState: Time.getNow(),
        currentChart: i,
        target: 1 // remember to set target to 1
      }
      /* if click repair/time chart, fetch the repair/time areaData */
      if (i === 6) {
        let areaStartTime = Time.getFirstWeekStart(Time.getMonthStart(NOW))
        let areaEndTime = Time.getTheLastWeekEnd(Time.getMonthEnd(NOW))
        const body={
          "endTime": areaEndTime,
          "startTime": areaStartTime,
          timeUnit: AREATIMEUNIT
        }
        this.fetchAreaData(body)

        let monthStr = Time.getMonthFormat(areaStartTime)
        nextState.monthStr = monthStr
        nextState.areaStartTime = areaStartTime
        nextState.areaEndTime = areaEndTime
        this.setState(nextState)
        return
      }

      /* else fetch the line data */
      let body = {}
      let {startTime, timeUnit, selectedSchool} = this.state
      body.startTime = startTime
      body.endTime = Time.getNow()
      body.timeUnit = timeUnit
      body.target = 1
      if(selectedSchool!=='all'){
        body.schoolId = parseInt(selectedSchool, 10)
      }
      this.setState(nextState)
      this.fetchData(body, {currentChart: i})
    }
  }  
  changeCurrent = (e) =>{
    e.preventDefault()
    let {currentMonth, selectedSchool}=this.state
    if(currentMonth){
      return
    }
    let newStartTime=Time.getFirstWeekStart(Time.getMonthStart(NOW)),newEndTime=Time.getTheLastWeekEnd(Time.getMonthEnd(NOW))
    const body={
      startTime:newStartTime,
      endTime:newEndTime,
      timeUnit:AREATIMEUNIT
    }
    if(selectedSchool!=='all'){
      body.schoolId=selectedSchool
    }
    this.fetchAreaData(body)
    this.setState({
      areaStartTime: newStartTime,
      areaEndTime:newEndTime,
      currentMonth: true,
      loading: true,
      monthStr:CURMONTHSTR
    })
  }
  selectRange = (date,dateString)=>{
    let {monthStr,selectedSchool}=this.state
    if(dateString===monthStr){
      return
    }
    let newStartTime = Time.getFirstWeekStart(Time.getMonthStart(dateString+'-1')),newEndTime=Time.getTheLastWeekEnd(Time.getMonthEnd(dateString+'-1'))
    let nextState = {
      monthStr:dateString,
      loading: true,
      areaStartTime: newStartTime,
      areaEndTime:newEndTime
    }
    const body = {
      timeUnit: AREATIMEUNIT,
      startTime: newStartTime,
      endTime: newEndTime
    }
    if(selectedSchool!=='all'){
      body.schoolId = parseInt(selectedSchool, 10)
    }
    if(dateString===CURMONTHSTR){
      nextState.currentMonth=true
    }else{
      nextState.currentMonth=false
    }
    this.setState(nextState)
    this.fetchAreaData(body)
  }
  changeSchool = (v) => {
    this.setState({
      selectedSchool: v
    })

    let body = {}, currentChart = this.state.currentChart
    body.startTime = this.state.startTime
    body.endTime = this.state.endTime
    body.timeUnit = this.state.timeUnit
    if(v !== 'all'){
      body.schoolId = parseInt(v, 10)
    }
    if (currentChart === 6) {
      this.fetchAreaData(body)
    } else {
      body.target = this.state.target
      this.fetchData(body)
    }
  }
  changeTimeSpan = (e) => {
    /*-----------if compared,clean it-----------*/
    e.preventDefault()
    let nextState = {}, timeUnit = 2
    let v = parseInt(e.target.getAttribute('data-value'), 10), timeSpan=this.state.timeSpan, newStartTime, newEndTime, body = {}
    if(v === timeSpan){
      return
    }
    nextState.timeSpan = v
    nextState.compareLock = false

    if(v===1){//today
      newStartTime = Time.getDayStart(NOW)
      newEndTime = Time.getDayEnd(NOW)
      timeUnit = 1
    }else if(v===2){
      newStartTime = Time.getWeekStart(NOW)
      newEndTime = Time.getWeekEnd(NOW)
    }else{
      newStartTime = Time.getMonthStart(NOW)
      newEndTime = Time.getMonthEnd(NOW)
    }

    nextState.startTime = newStartTime
    nextState.endTime = newEndTime
    nextState.timeUnit = timeUnit

    body.startTime = newStartTime
    body.endTime = newEndTime
    body.timeUnit = timeUnit
    body.target = this.state.target

    if(this.state.selectedSchool!=='all'){
      body.schoolId = parseInt(this.state.selectedSchool, 10)
    }
    this.fetchData(body, {startTime: newStartTime, endTime: newEndTime, timeSpan: v, timeUnit: timeUnit})

    this.setState(nextState)
  }

  compareLast = (checked)=>{
    let nextState = {
      compare: checked
    }
    this.setState(nextState)

    if (checked) {
      this.fetchCompareData()
    } else {
      this.removeCompareData()
    }
  }

  render() {
    const { data, selectedSchool, timeUnit, target,timeSpan,compare, currentChart, currentMonth, monthStr, areaData } = this.state;
    
    return (
      <div className='chart'>
        
        <div className='selectBar'>
          <h3>统计图表</h3>

          <div className='selectBox'>
            <SchoolSelector
              selectedSchool={selectedSchool}
              changeSchool={this.changeSchool}
            />
          </div>

          {
            currentChart !== 6 ?
              <div className='timespan'>
                <a data-value={1} ref='tp1' className={CLASSNAMES[0][timeSpan]} onClick={this.changeTimeSpan} >本日</a>
                <a data-value={2} ref='tp2' className={CLASSNAMES[1][timeSpan]} onClick={this.changeTimeSpan} >本周</a>
                <a data-value={3} ref='tp3' className={CLASSNAMES[2][timeSpan]} onClick={this.changeTimeSpan} >本月</a> 
              </div>
            : null
          }

          {
            currentChart !== 6 ?
              <div className='selCompare'>
                <span className='compare'>对比{LASTDAY[timeSpan]}</span>
                <Switch checked={compare} size='small' onChange={this.compareLast} />
              </div>
            : null
          }

          {
            currentChart === 6 ?
              <div className='areaQuery'>
                  <a className={currentMonth?'on padR':'padR'} onClick={this.changeCurrent} >本月</a>
                  <MonthPicker allowClear={false}  value={moment(monthStr)} className='rangePicker' onChange={this.selectRange} />
              </div>
            : null
          }
        </div>

        <ul className='chartSelector' onClick={this.chooseChart} >
          <li data-index={1} className={currentChart === 1 ? 'active' : ''} >
            订单统计
            {currentChart === 1 ? <div className='bdbtm'></div> : null}
          </li>
          <li data-index={2} className={currentChart === 2 ? 'active' : ''} >
            用户统计
            {currentChart === 2 ? <div className='bdbtm'></div> : null}
          </li>
          <li data-index={3} className={currentChart === 3 ? 'active' : ''} >
            红包使用统计
            {currentChart === 3 ? <div className='bdbtm'></div> : null}
          </li>
          <li data-index={4} className={currentChart === 4 ? 'active' : ''} >
            资金统计
            {currentChart === 4 ? <div className='bdbtm'></div> : null}
          </li>
          <li data-index={5} className={currentChart === 5 ? 'active' : ''} >
            设备报修统计
            {currentChart === 5 ? <div className='bdbtm'></div> : null}
          </li>
          <li data-index={6} className={currentChart === 6 ? 'active' : ''} >
            设备报修处理时间统计
            {currentChart === 6 ? <div className='bdbtm'></div> : null}
          </li>
        </ul>

        <div>

          {
            currentChart !== 6 ? 
            <div>
              <div className='query'>
                <div>
                  <a data-value={1} className={target===1?'padLR on':'padLR'} onClick={this.changeTarget}>{data1label[currentChart]}</a>
                  {data2Name[currentChart] ? <a data-value={2} className={target===2?'on':''} onClick={this.changeTarget}>{data2label[currentChart]}</a> : null }
                </div> 
              </div>
              <div className="lineChartWrapper">
                <LineChart
                  width={CONSTANTS.CHARTWIDTH} height={CONSTANTS.CHARTHEIGHT} data={data}
                  margin={{ top: 10, right: 20, bottom: 0, left: 40 }}
                >
                  <CartesianGrid vertical={false} horizontal={false} />
                  <XAxis padding={{left: 20}} axisLine={{stroke:'#ddd'}} name='date' dataKey="x" tick={<CustomizedXAxisTick timeUnit={timeUnit} />} tickLine={false}/>
                  <YAxis axisLine={{stroke:'#ddd'}} domain={[0, 'dataMax']} tickLine={false} tick={<CustomizedAxisTick />} />
                  <Tooltip isAnimationActive={false} cursor={{ stroke: '#222', strokeWidth: 1 }} content={<CustomizedTooltip timeUnit={timeUnit} />}  />
                  <Legend align='left' verticalAlign="top" iconType='line' margin={{left:-20}} wrapperStyle={{paddingLeft:20,top:-15}} width={300} height={36}  />
                  <Line name={compare?`${DAY[timeSpan]}${LEGEND[CHARTTYPES[currentChart]][target][0]}`:`${LEGEND[CHARTTYPES[currentChart]][target][0]}`} dataKey="y" label='饮水机'  stroke="#4aaaef" dot={false} activeDot={{strokeWidth: 2}} />
                  {data2Name[currentChart] ? <Line name={compare?`${DAY[timeSpan]}${LEGEND[CHARTTYPES[currentChart]][target][1]}`:`${LEGEND[CHARTTYPES[currentChart]][target][1]}`} dataKey='y2' stroke='#97da7b' dot={false} activeDot={{strokeWidth: 2}} /> : null}
                  {compare ? <Line name={compare?`${LASTDAY[timeSpan]}${LEGEND[CHARTTYPES[currentChart]][target][0]}`:`${LEGEND[CHARTTYPES[currentChart]][target][0]}`} dataKey='lasty' stroke='#ffa312' dot={false} activeDot={{strokeWidth: 2}} /> : null}
                  {compare&&data2Name[currentChart] ? <Line name={compare?`${LASTDAY[timeSpan]}${LEGEND[CHARTTYPES[currentChart]][target][1]}`:`${LEGEND[CHARTTYPES[currentChart]][target][1]}`} dataKey='lasty2' stroke='#ff5555' dot={false} activeDot={{strokeWidth: 2}} /> : null}
                </LineChart>
              </div> 
            </div> 
            : null
          }
          {
            currentChart === 6 ? 
            <div>
              <div className="areaChartWrapper">
                <AreaChart
                  width={CONSTANTS.CHARTWIDTH} height={CONSTANTS.CHARTHEIGHT} data={areaData}
                  margin={{ top: 10, right: 20, bottom: 0, left: 40 }}
                >
                  <CartesianGrid vertical={false} horizontal={false} />
                  <XAxis padding={{left: 20}} axisLine={{stroke:'#ddd'}} name='' dataKey="x" tickLine={false}/>
                  <YAxis axisLine={{stroke:'#ddd'}} domain={[0, 'dataMax']} tickLine={false} tick={<AreaYAxisTick />} />
                  <Tooltip isAnimationActive={false} cursor={{ stroke: '#222', strokeWidth: 1 }} content={<AreaTooltip monthStr={monthStr} />} />
                  <Legend align='left' verticalAlign="top" margin={{left:-20}} wrapperStyle={{paddingLeft:20,top:-15}} content={<AreaLegend  />} height={36}  />
                  <Area name='客服处理时间' type='monotone' dataKey='assign' stackId="1"  fill='#ff5555' stroke='false' activeDot={{ stroke: '#ff5555', strokeWidth: 2,fill:'#fff'}}/>
                  <Area name='维修员接受时间' type='monotone' dataKey='y' stackId="1" fill='#4aaaef' stroke='false' activeDot={{ stroke: '#4aaaef', strokeWidth: 2,fill:'#fff'}} />
                  <Area name='维修时间' type='monotone' dataKey='repair' stackId="1" fill='#97da7b' stroke='false' activeDot={{ stroke: '#97da7b', strokeWidth: 2,fill:'#fff'}} />
                </AreaChart>
              </div>
            </div>
            : null
          }
        </div>
      </div>
    );
  }
}

const CustomizedTooltip = React.createClass({
  render () {
    const {payload, label, active} = this.props;
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

    const y2s = !!payload&&payload.filter((r,i)=>{
      return r.dataKey === 'y2'
    })
    const y2Items = !!y2s&&y2s.map((r,i)=>{
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

    const lastys = !!payload&&payload.filter((r,i)=>{
      return r.dataKey === 'lasty'
    })
    const lastYItems = !!lastys&&lastys.map((r,i)=>{
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

    const lasty2s = !!payload&&payload.filter((r,i)=>{
      return r.dataKey === 'lasty2'
    })
    const lastY2Items = !!lasty2s&&lasty2s.map((r,i)=>{
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
            {!!y2s?y2Items:null}
            {!!lastys.length?(<li className='label'>{lastys[0].payload.lastX}</li>):null}
            {!!lastys.length?lastYItems:null}
            {!!lasty2s.length?lastY2Items:null}
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
    const {x, y, payload,timeUnit} = this.props;
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dx={5} dy={12} textAnchor="end" fill="#999" transform="rotate(-35)">{timeUnit===2?Format.dayLabel(payload.value):Format.hourLabel(payload.value)}</text>
      </g>
    );
  }
});

const CustomizedAxisTick = React.createClass({
  render () {
    const {x, y, payload} = this.props;
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={0} textAnchor="end" fill="#999">{payload.value}</text>
      </g>
    );
  }
});
const AreaLegend = (props) => {
  const { payload } = props;

  return (
    <ul>
      {
        payload.map((entry, index) => (
          <span className='rectLegend' key={`item-${index}`}>
            <svg key={`svg${index}`} className='rectIcon' >
              <rect x="0" y='0' width='20' height='10' fill={entry.payload.fill}/>
            </svg>
            {entry.value}
          </span>
        ))
      }
    </ul>
  );
}

const AreaTooltip = React.createClass({
  render () {
    const {payload, label, active,monthStr} = this.props;

    const payloads = payload&&payload.map((r,i)=>{
        return (
          <li key={i}>
            <svg key={`svg${i}`} className='rectIcon' >
              <rect x="0" y='0' width='20' height='10' fill={r.fill}/>
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
            <li className='label'>{Format.monthFormat(monthStr)} {label}</li>
            {payloads}
          </ul>
        </div>
      )
    }else{
      return null
    }
  }
});

const AreaYAxisTick = React.createClass({
  render () {
    const {x, y, payload} = this.props;
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={0} textAnchor="end" fill="#999">{payload.value}小时</text>
      </g>
    );
  }
});