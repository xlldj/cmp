import React from 'react'
import AjaxHandler from '../ajax'
import Time from '../component/time'
import CONSTANTS from '../component/constants'
import {asyncComponent} from '../component/asyncComponent'
import Pagination from 'rc-pagination'
import 'rc-pagination/assets/index.css'

const TaskCard = asyncComponent(()=>import(/* webpackChunkName: "taskCard" */ "../component/taskCard"))

const TYPES = {
  2: '设备报修',
  1: '用户提现'
}
const DEVICETYPES = CONSTANTS.DEVICETYPE
const STATUS = CONSTANTS.REPAIRSTATUS
/*------后端接受的all为true/false,必传，post之前将0，1转为true/false---------*/
/*------后端接受的pending为int，不传为所有，我用0表示不传---------------------*/
/*------rule表示顺序或倒序，1为倒序，默认值----------------------------------*/
/*------sourcetype不传表示所有，我用0代替，1为体现，2为维修-------------------*/

class TaskList extends React.Component {
  constructor (props) {
    super(props)
    let pendingTasks = [], assingedTasks = [], all=0,  pending=0, rule=1, sourceType = 0, totalPending = 0, totalDone = 0
    this.state = {pendingTasks, assingedTasks, all, pending, rule, sourceType, totalPending, totalDone}
  }
  fetchWaitingData = (body) => {
    let resource = '/api/work/sheet/list'
    const cb = (json) => {
      if(json.error){
        throw new Error(json.error)
      }else{        
        let workSheets = json.data.workSheets
        this.setState({
          pendingTasks: workSheets,
          totalPending: json.data.total
        })
      }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  fetchAssignedTask = (body) => {
    let resource = '/api/work/sheet/list'
    const cb = (json) => {
      if(json.error){
        throw new Error(json.error)
      }else{
        let workSheets = json.data.workSheets
        this.setState({
          assingedTasks: workSheets,
          totalDone: json.data.total
        })
      }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  componentDidMount(){
    /*----------------change the query with userId--------------*/
    const body = {
      page: 1,
      size: CONSTANTS.TASKSIZE,
      assigned: false,
      all: false
    }
    this.fetchWaitingData(body)
    const b = {
      page: 1,
      size: CONSTANTS.TASKSIZE,
      assigned: true,
      all: false
    }
    this.fetchAssignedTask(b)
  }
  changeDivision = (e)=> {
    let all = this.state.all, v = parseInt(e.target.value)
    if(all !== v){
      const body = {
        page: 1,
        size: CONSTANTS.TASKSIZE,
        assigned: false,
        rule: this.state.rule,
        all: !!v
      }
      if(this.state.pending!==0){
        body.pending = this.state.pending
      }
      if(this.state.sourceType!==0){
        body.sourceType = this.state.sourceType
      }
      this.fetchWaitingData(body)
      this.setState({
        all: v
      })
    }
  }
  changeType = (e) => {
    let v = parseInt(e.target.value)
    if(v!==this.state.sourceType){
      const body = {
        page: 1,
        size: CONSTANTS.TASKSIZE,
        assigned: false,
        rule: this.state.rule,
        all: !!this.state.all
      }
      if(this.state.pending!==0){
        body.pending = this.state.pending
      }
      if(v!==0){
        body.sourceType = v
      }
      this.fetchWaitingData(body)      
      this.setState({
        sourceType: v
      })
    }
  }
  changePending = (e) => {
    let v = parseInt(e.target.value)
    if(v!==this.state.pending){
      const body = {
        page: 1,
        size: CONSTANTS.TASKSIZE,
        assigned: false,
        rule: this.state.rule,
        all: !!this.state.all
      }
      if(v!==0){
        body.pending = v
      }
      if(this.state.sourceType!==0){
        body.sourceType = this.state.sourceType
      }
      this.fetchWaitingData(body)      
      this.setState({
        pending: v
      })
    }
  }
  changeRule = (e) => {
    let v = parseInt(e.target.value)
    if(v!==this.state.rule){
      const body = {
        page: 1,
        size: CONSTANTS.TASKSIZE,
        assigned: false,
        rule: v,
        all: !!this.state.all
      }
      if(this.state.pending!==0){
        body.pending = this.state.pending
      }
      if(this.state.sourceType!==0){
        body.sourceType = this.state.sourceType
      }
      this.fetchWaitingData(body)      
      this.setState({
        rule: v
      })
    }
  }
  changePage = (current, pageSize) => {
    const body = {
      page: current,
      size: pageSize,
      assigned: false,
      all: !!this.state.all,
      rule: this.state.rule
    }
    if(this.state.pending!==0){
      body.pending = this.state.pending
    }
    if(this.state.sourceType!==0){
      body.sourceType = this.state.sourceType
    }
    this.fetchWaitingData(body)
  }
  changeDonePage = (current, pageSize) => {
    const b = {
      page: current,
      size: pageSize,
      assigned: true,
      all: false
    }
    this.fetchAssignedTask(b)
  }
  render () {
    const {pendingTasks, assingedTasks, all, pending, rule, sourceType, totalPending, totalDone} = this.state
    const pendingTaskItems = pendingTasks.map((r,i)=>{
        let createTime = Time.getTimeStr(r.createTime)
        let waitTime = Time.getSpan(r.createTime)
      return (
        <TaskCard 
          key={i} 
          type={TYPES[r.sourceType]} 
          name={(r.deviceType?DEVICETYPES[r.deviceType]:'订单号')+r.sourceNo} 
          username={r.assignName} 
          createTime={createTime} 
          waitTime={waitTime} 
          statusIntro={r.status===1?'等待客服处理':`已指派${r.assignName}（被拒绝）`} 
          hintCount={r.hintCount} 
          detailAddr={r.sourceType===2?`/device/repair/repairInfo/:${r.sourceId}`:`/fund/fundInfo/:${r.sourceId}`} 
        />
      )
    })

    const assignedTaskItems = assingedTasks.map((r,i)=>{
        let createTime = Time.getTimeStr(r.createTime)
        let waitTime = Time.getSpan(r.createTime)
        let assignPassed = r.assignTime ? Time.getSpan(r.assignTime) + '前' : '暂无'
      return (
        <TaskCard 
          assigned={true} 
          level={r.level} 
          key={i}  
          type={TYPES[r.sourceType]} 
          name={(r.deviceType?DEVICETYPES[r.deviceType]:'订单号')+r.sourceNo} 
          username={r.assignName} 
          createTime={createTime} 
          waitTime={waitTime} 
          statusIntro={`已指派${r.assignName}`} 
          assignPassed={assignPassed} 
          detailAddr={r.sourceType===2?`/device/repair/repairInfo/:${r.sourceId}`:`/fund/fundInfo/:${r.sourceId}`} 
        />
      )
    })
    return (
      <div className='contentContainer'>
        <div className='pendingTask'>
          <h1>等待处理的任务</h1>
          <ul className='queryPanel'>
            <li>
              <span>任务分工：</span>
              <button className={!all?'hollow round active':'hollow round'} value={0} onClick={this.changeDivision} >待我处理的任务</button>
              <button className={all?'hollow round active':'hollow round'} value={1} onClick={this.changeDivision} >所有待处理的任务</button>
            </li>
            <li>
              <span>任务类型：</span>
              <button className={sourceType===0?'hollow round active':'hollow round'} value={0} onClick={this.changeType} >所有类型任务</button>
              <button className={sourceType===2?'hollow round active':'hollow round'} value={2} onClick={this.changeType} >报修任务</button>
              <button className={sourceType===1?'hollow round active':'hollow round'} value={1} onClick={this.changeType} >提现任务</button>
            </li>
          </ul>
          <ul className='queryPanel'>
            <li>
              <span>等待时间：</span>
              <button className={pending===0?'hollow round active':'hollow round'} value={0} onClick={this.changePending} >所有等待任务</button>
              <button className={pending===1?'hollow round active':'hollow round'} value={1} onClick={this.changePending} >超过一天未处理</button>
              <button className={pending===2?'hollow round active':'hollow round'} value={2} onClick={this.changePending} >超过两天未处理</button>
            </li>
            <li>
              <span>排列顺序：</span>
              <button className={rule===1?'hollow round active':'hollow round'} value={1} onClick={this.changeRule} >时间倒序排列</button>
              <button className={rule===2?'hollow round active':'hollow round'} value={2} onClick={this.changeRule} >时间正序排列</button>
            </li>
          </ul>
          <div className='cardPanel' >
            {pendingTaskItems}
          </div>
          { totalPending > CONSTANTS.TASKSIZE ? <Pagination 
            className='pagi'
            pageSize={CONSTANTS.TASKSIZE}
            total={totalPending}
            onChange={this.changePage}
          /> : null }
        </div>
        <div className='assignedTask'>
          <h1>已指派的报修任务<span className='subHead'>（等待维修员接任务）</span></h1>
          <div className='cardPanel' >
            {assignedTaskItems}
          </div>
          { totalDone > CONSTANTS.TASKSIZE ? <Pagination 
            className='pagi'
            pageSize={CONSTANTS.TASKSIZE}
            total={totalDone}
            onChange={this.changeDonePage}
          /> : null }
        </div>
      </div>
    )
  }
}

export default TaskList
