import React from 'react'
import {Link} from 'react-router-dom'

import {Button} from 'antd'

import Time from '../../component/time'
import AjaxHandler from '../../ajax'
import CONSTANTS from '../../component/constants'
import Noti from '../../noti'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeOrder } from '../../../actions'

const typeName = CONSTANTS.DEVICETYPE
const REPAIRSTATUS = CONSTANTS.REPAIRSTATUS
const BACKTITLE = {
  fromRepair: '返回报修详情'
}
class DeviceInfo extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      data: {},
      id: 0,
      deviceType: '',
      residenceId: '',
      repairs: []
    }
  }
  fetchRepairs = (body) => {
    let resource = '/repair/list'
    const cb = (json) => {
      if (json.data) {
        this.setState({
          repairs: json.data.repairDevices
        })
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  componentDidMount(){
    this.props.hide(false)
    let {deviceType, id, residenceId, path} = this.props.location.state
    this.setState({
      deviceType: deviceType,
      id: id,
      residenceId: residenceId
    })
    let resource, body
    if (path && path === 'fromRepair') {
      resource = '/device/group/one'
      body = {
        id: id
      }
    } else if (deviceType === 2) {
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
    const cb=(json)=>{
      if(json.error){
        Noti.hintServiceError(json.error.displayMessage)
      }else{
        this.setState({
          data: json.data
        })
      }
    }
    AjaxHandler.ajax(resource,body,cb)

    /* fetch repair logs */

    const data = {
      residenceId: residenceId,
      deviceType: 2,
      status: [1, 2, 3, 4, 6, 7]
    }
    this.fetchRepairs(data)
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  back = () => {
    this.props.history.goBack()
  }
  toOrderOfDevice = () => {
    this.props.changeOrder('orderList', 
      {
        page: 1, schoolId: 'all', deviceType: 'all', status: 'all', 
        selectKey: '', startTime: Time.get7DaysAgoStart(), endTime: Time.getTodayEnd()
      }
    )
    let {data, deviceType} = this.state
    this.props.history.push({pathname:'/order/list',state:{path: 'fromDevice', id: data.residenceId, deviceType: deviceType}})
  }
  render () {
    let {data, deviceType, repairs} = this.state
    const rateItems = deviceType === 2 && data.water && Object.keys(data.water).map((key,i) => {
      let r = data.water[key]
      return(
          <div className='rateSets' key={i}>
            <span key={`input${i}`}>{r.price?r.price * 100:''}分/{r.pulse?r.pulse:''}脉冲</span>
          </div>
      )
    })
    const repairItems = repairs && repairs.map((record,index) => (
        <div className='repairSlot' key={`div${index}`}>
          <ul key={`ul${index}`}>
            <li key={index}>
              <p key={`status${index}`}>维修状态:</p>
              <span key={`repairStatus${index}`} className='padR20'>{REPAIRSTATUS[record.status]}</span>
              <Link key={`link${index}`} to={{pathname:`/device/repair/repairInfo/:${record.id}`,state: {path: 'fromDevice'}}} >查看详情</Link>
            </li>
            {
              record.status !== 1 ?
                <li key={`person${index}`}>
                  <p key={`pp${index}`}>维修人员:</p>
                  <span>{record.assignName}</span>
                </li>
              : null
            }
            {record.status === 7 ?
              <li key={`finish${index}`}>
                <p key={`finishp${index}`}>维修完成时间</p>
                {Time.getTimeStr(record.finishTime)}
              </li>
              :
              <li key={`createtime${index}`}>
                <p key={`creatp${index}`}>用户申请时间:</p>{Time.getTimeStr(record.createTime)}
              </li>
            }
            {
              record.status === 7 ? null:
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
    let waterMac = data.water ? Object.keys(data.water).map((key, i) => (<span key={`water${i}`} className='waterMacItem'>{data.water[key].macAddress}</span>)) : null
    let propState = this.props.history.location.state
    return (
      <div 
        className={repairs && repairs.length>0 ? 'infoBlockList deviceInfo columnLayout' : 'infoBlockList deviceInfo'}
      >
        <div className={'infoBlock'}>
          <h3>设备信息</h3>
          <ul>
            <li><p>学校名称:</p>{data.schoolName}</li>
            <li><p>设备类型:</p>{deviceType === 2 ? typeName[deviceType] : typeName[data.type]}</li>
            <li><p>设备ID:</p>{deviceType === 2 ? waterMac : data.macAddress}</li>
            <li><p>设备位置:</p>{data.location||'暂无'}</li>
            <li className='itemsWrapper'>
              <p>设备费率:</p>
              {deviceType !== 2 ? `${data.price * 100}分钱/${data.pulse}个脉冲` : <div>{rateItems}</div>}
            </li>
            <li><p>绑定时间:</p>{time}</li>
          </ul>
        </div>

        <div className='infoBlock' >
          <h3>订单记录</h3>
          <ul>
            <li>
              <p>订单记录:</p>
              <a onClick={this.toOrderOfDevice} >查看详情</a>
            </li>
          </ul>
        </div>

        {repairs && repairs.length>0?repairsLog:null}

        <div className='btnArea'>
          <Button onClick={this.back}>{(propState && propState.path) ? BACKTITLE[propState.path] : '返回'}</Button>
        </div>
      </div>
    )
  }
}


export default withRouter(connect(null, {
  changeOrder
})(DeviceInfo))