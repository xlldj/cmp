import React from 'react'
import {Link} from 'react-router-dom'

import {Button} from 'antd'
import {asyncComponent} from '../../component/asyncComponent'

import Time from '../../component/time'
import AjaxHandler from '../../ajax'
import CONSTANTS from '../../component/constants'


import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeOrder } from '../../../actions'


const typeName = CONSTANTS.DEVICETYPE
const STATUS = CONSTANTS.DEVICESTATUS
const REPAIRSTATUS = CONSTANTS.REPAIRSTATUS
const WATERTYPE = CONSTANTS.WATERTYPE

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
      } else {
        throw {
          title: '请求出错',
          message: json.error&&json.error.displayMessage || '请稍后重试'
        }
      } 
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  componentDidMount(){
    this.props.hide(false)
    let {deviceType, id, residenceId} = this.props.location.state
    this.setState({
      deviceType: deviceType,
      id: id,
      residenceId: residenceId
    })
    let resource, body
    if (deviceType === 2) {
      resource = '/device/water/one'
      body = {
        id: residenceId
      }
      const data = {
        residenceId: residenceId,
        deviceType: 2
      }
      this.fetchRepairs(data)
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
  toOrderOfDevice = () => {
    this.props.changeOrder('order', 
      {
        page: 1, schoolId: 'all', deviceType: 'all', status: 'all', 
        selectKey: '', startTime: Time.get7DaysAgo(), endTime: Time.getNow()
      }
    )
    let {data, deviceType} = this.state
    this.props.history.push({pathname:'/order',state:{path: 'fromDevice', id: data.residenceId, deviceType: deviceType}})
  }
  render () {
    let {data, deviceType, residenceId, repairs} = this.state
    const rateItems = deviceType === 2 && data.water && Object.keys(data.water).map((key,i) => {
      let r = data.water[key]
      return(
          <div className='rateSets' key={i}>
            <span key={`input${i}`}>{r.price?r.price * 100:''}分/{r.pulse?r.pulse:''}脉冲</span>
          </div>
      )
    })
    let repairData = deviceType === 2 ? repairs : (data.repairs ? data.repairs : [])
    const repairItems = repairData.map((record,index) => (
        <div className='repairSlot' key={`div${index}`}>
          <ul key={`ul${index}`}>
            <li key={index}>
              <p key={`status${index}`}>维修状态:</p>
              <span key={`repairStatus${index}`} className='padR20'>{REPAIRSTATUS[record.status]}</span>
              <Link key={`link${index}`} to={{pathname:`/device/repair/repairInfo/:${record.id}`,state:'fromDevice'}} >查看详情</Link>
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
    let waterMac = data.water ? Object.keys(data.water).map((key, i) => (<span key={`water${i}`} className='waterMacItem'>{data.water[key].macAddress}</span>)) : null
    return (
      <div 
        className={repairData&&repairData.length>0 ? 'infoBlockList deviceInfo columnLayout' : 'infoBlockList deviceInfo'}
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

        {repairData&&repairData.length>0?repairsLog:null}

        <div className='btnArea'>
          <Button onClick={this.back}>返回</Button>
        </div>
      </div>
    )
  }
}


export default withRouter(connect(null, {
  changeOrder
})(DeviceInfo))