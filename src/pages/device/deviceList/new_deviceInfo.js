import React from 'react'
import {Link} from 'react-router-dom'

import {Button} from 'antd'
import {asyncComponent} from '../../component/asyncComponent'

import Time from '../../component/time'
import AjaxHandler from '../../ajax'
import CONSTANTS from '../../component/constants'

const typeName = CONSTANTS.DEVICETYPE
const STATUS = CONSTANTS.DEVICESTATUS
const REPAIRSTATUS = CONSTANTS.REPAIRSTATUS

class DeviceInfo extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      data: {},
    }
  }
  componentDidMount(){
    this.props.hide(false)
    let {deviceType, id, residenceId} = this.props.location.state
    console.log(this.props.location.state)
    let resource, body
    if (deviceType === 2) {
      resource = '/device/water/one'
      body = {
        id: residenceId
      }
    } else {
      resource = '/device/query/one'
      body = {
        id: id
      }
    }
    /*const body = {
      id: parseInt(this.props.match.params.id.slice(1))
    }*/
    const cb=(json)=>{
      if(json.error){
        throw new Error(json.error)
      }else{
        this.setState({
          data: json.data
        })
      }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  back = () => {
    this.props.history.goBack()
  }
  render () {
    let data = this.state.data
    const rateItems = data.rate && data.rate.rateGroups && data.rate.rateGroups.map((r,i) => {
      return(
          <div className='rateSets' key={i}>
            <span key={`input${i}`}>{r.price?r.price:''}</span>
            <span key={`span2${i}`}>分</span>
            <span key={`pulse${i}`}>{r.pulse?r.pulse:''}</span>
            <span key={`span3${i}`}>脉冲</span>
          </div>
      )
    })
    let repairs = data.repairs
    const repairItems = repairs&&repairs.map((record,index) => (
      <div className='repairSlot' key={`div${index}`}>
        <ul key={`ul${index}`}>
          <li key={index}>
            <p key={`status${index}`}>维修状态:</p>
            <span className='padR20'>{REPAIRSTATUS[record.status]}</span>
            <Link to={{pathname:`/device/repair/repairInfo/:${record.id}`,state:'fromDevice'}} >查看详情</Link>
          </li>
          <li key={`person${index}`}>
            <p key={`pp${index}`}>维修人员:</p>{record.status===1?'未指派':record.assignName}
          </li>
          {record.status===5?
            (<li key={`finish${index}`}>
              <p key={`finishp${index}`}>维修完成时间</p>
              {Time.getTimeStr(record.finishedTime)}
            </li>)
            :
          (<li key={`createtime${index}`}>
            <p key={`creatp${index}`}>用户申请时间:</p>{Time.getTimeStr(record.createTime)}
          </li>)
          }
          {record.status===5?null:
            (<li key={`waitingtime${index}`}>
              <p key={`waitp${index}`}>用户等待时间:</p>{Time.getSpan(record.createTime)}
            </li>)
          } 
        </ul>
      </div>
    ))
    const repairsLog = (
      <div className='infoBlock'>
        <h3>报修记录</h3>
        <div className='repairLogs'>{repairItems}</div>
      </div>
    )
    let time = Time.getTimeStr(data.bindingTime)
    return (
      <div 
        className={data.repairs&&data.repairs.length>0 ? 'infoBlockList deviceInfo columnLayout' : 'infoBlockList deviceInfo'}
      >
        <div className={data.repairs&&data.repairs.length>0 ? 'infoBlock' : 'infoBlock'}>
          <h3>设备信息</h3>
          <ul>
            <li><p>学校名称:</p>{data.schoolName}</li>
            <li><p>设备类型:</p>{typeName[data.type]}</li>
            <li><p>设备ID:</p>{data.macAddress}</li>
            <li><p>设备位置:</p>{data.location||'暂无'}</li>
            <li><p>设备费率:</p>{`${data.price}分钱/${data.pulse}个脉冲`}</li>
            <li><p>绑定时间:</p>{time}</li>
          </ul>
        </div>

        <div className='infoBlock' >
          <h3>订单记录</h3>
          <ul>
            <li>
              <p>订单记录:</p>
              <Link to={{pathname:'/order',state:{path: 'fromDevice', id: data.id}}} >查看详情</Link>
            </li>
          </ul>
        </div>

        {data.repairs&&data.repairs.length>0?repairsLog:null}

        <div className='btnArea'>
          <Button onClick={this.back}>返回</Button>
        </div>
      </div>
    )
  }
}

export default DeviceInfo
