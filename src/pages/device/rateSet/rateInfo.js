import React from 'react'

import {Button} from 'antd'

import AjaxHandler from '../../ajax'
import Noti from '../../noti'
import AddPlusAbs from '../../component/addPlusAbs'
import CONSTANTS from '../../component/constants'
import SchoolSelector from '../../component/schoolSelectorWithoutAll'
import DeviceWithoutAll from '../../component/deviceWithoutAll'
import BasicSelectorWithoutAll from '../../component/basicSelectorWithoutAll'
import {mul} from '../../util/numberHandle'

const BACKTITLE = {
  fromInfoSet: '返回学校信息设置'
}

class RateInfo extends React.Component {
  constructor (props) {
    super(props)
    let id = 0, deviceType = '', schoolId = '', billingMethod = '', originalDT = 0, originalSchool = 0
    let rateGroups = [{}], deviceTypeError=false, schoolError=false, billError=false, closeTapGroups = [{}]
    this.state = { 
      id, deviceType, billingMethod, schoolId, schoolError, rateGroups,deviceTypeError, billError, closeTapGroups, 
      originalDT, originalSchool,
      posting: false,
      checking: false
    }
  }
  /*
  fetchSuppliers = ()=>{
    let resource='/api/supplier/query/list'
    const body={
      page: 1,
      size: 100
    }
    const cb = (json) => {
        if(json.error){
          throw new Error(json.error.displayMessage || json.error)
        }else{
          if(json.data){
            const suppliers = {}
            for(let i=0;i<json.data.total;i++){
              suppliers[json.data.supplierEntities[i].id] = json.data.supplierEntities[i].name
            }
            this.setState({
              suppliers: suppliers
            })
          }else{
            throw new Error('网络出错，获取供应商列表失败，请稍后重试～')
          }        
        }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  */
  fetchData =(body)=>{
    let resource='/api/rate/one'
    const cb=(json)=>{
      if(json.error){
        throw new Error(json.error.displayMessage || json.error)
      }else{
        if(json.data){
          let r=json.data
          const taps = r.timeLimit&&r.timeLimit.map((r) => ({value: r}))
          const rateGroups = r.rateGroups&&r.rateGroups.map((rate) => ({
            price: mul(rate.price, 100),
            pulse: rate.pulse
          }))
          let nextState = {
            deviceType: r.deviceType,
            originalDT: r.deviceType,
            schoolId: r.schoolId,
            originalSchool: r.schoolId,
            billingMethod: r.billingMethod.toString(),
            rateGroups: rateGroups
          }
          if (taps) {
            nextState.closeTapGroups = taps
          }
          this.setState(nextState)
        }else{
          throw new Error('网络出错，获取供应商列表失败，请稍后重试～')
        }        
      }
    }
    AjaxHandler.ajax(resource,body,cb)
  }

  componentDidMount(){
    this.props.hide(false)
    if(this.props.match.params.id){
      let id = parseInt(this.props.match.params.id.slice(1), 10)
      const body={
        id: id
      }
      this.fetchData(body)
      this.setState({
        id: id
      })
    }
  }
  componentWillUnmount () {
    this.props.hide(true)
  }

  changeDevice = (v) => {
    let nextState = {deviceType: v}
    let rateGroups = [{}]
    if (v === '2') {
      rateGroups.push({})
      rateGroups.push({})
      nextState.rateGroups =rateGroups
    } else {
      nextState.rateGroups = rateGroups
    }
    this.setState(nextState)
  }
  checkDevice = (v) => {
    if (v === '0' || !v) {
      return this.setState({
        deviceTypeError: true
      })
    }
    this.setState({
      deviceTypeError: false
    })
    let {id, deviceType, originalDT, schoolId, originalSchool} = this.state
    if (!schoolId) { // 如果没有供应商选项，不去查重
      return
    }
    if (!(id && parseInt(deviceType, 10) === originalDT && parseInt(schoolId, 10) === originalSchool)) {
      this.checkExist(null)
    }
  }
  changeSchool = (v) => {
    this.setState({
      schoolId : v
    })
  }
  checkSchool = (v) => {
    if (!v) {
      return this.setState({
        schoolError: true
      })
    }
    this.setState({
      schoolError: false
    })
    let {id, deviceType, originalDT, schoolId, originalSchool} = this.state
    if (!deviceType) { // 如果没有供应商选项，不去查重
      return
    }
    if (!(id && parseInt(deviceType, 10) === originalDT && parseInt(schoolId, 10) === originalSchool)) {
      this.checkExist(null)
    }
  }
  checkExist = (callback) => {
    if (this.state.checking) {
      return
    }
    this.setState({
      checking: true
    })
    let resource = '/rate/check'
    const {deviceType, schoolId} = this.state
    const body = {
      deviceType: parseInt(deviceType, 10),
      schoolId: parseInt(schoolId, 10)
    }
    const cb = (json) => {
      this.setState({
        checking: false
      })
      if (json.error) {
        Noti.hintServiceError(json.error.displayMessage)
      } else {
        if (json.data.result) {
          Noti.hintLock('添加出错', '当前学校的该类型设备已有费率选项，请勿重复添加')
        } else {
          if (callback) {
            callback()
          }
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  changePrice = (e,i) => {
    const rateGroups = JSON.parse(JSON.stringify(this.state.rateGroups))
    rateGroups[i].price = parseInt(e.target.value, 10)
    this.setState({
      rateGroups: rateGroups
    })
  }
  checkPrice = (e,i) => {
    const rateGroups = JSON.parse(JSON.stringify(this.state.rateGroups))
    if (!rateGroups[i].price) {
      rateGroups[i].error = true
      return this.setState({
        rateGroups: rateGroups
      })
    }
    rateGroups[i].error = false
    this.setState({
      rateGroups: rateGroups
    })
  }
  changePulse = (e,i) => {
    const rateGroups = JSON.parse(JSON.stringify(this.state.rateGroups))
    rateGroups[i].pulse = parseInt(e.target.value, 10)
    this.setState({
      rateGroups: rateGroups
    }) 
  }
  checkPulse = (e,i) => {
    const rateGroups = JSON.parse(JSON.stringify(this.state.rateGroups))
    if (!rateGroups[i].pulse) {
      rateGroups[i].error = true
      return this.setState({
        rateGroups: rateGroups
      })
    }
    rateGroups[i].error = false
    this.setState({
      rateGroups: rateGroups
    })
  }
  checkInput = () => {
    let {rateGroups, deviceType, billingMethod, schoolId, closeTapGroups} = this.state
    if (!deviceType || deviceType==='0') {
      this.setState({
        deviceTypeError: true
      })
      return false
    }
    let nextState = {deviceTypeError: false}
    if (!schoolId || schoolId==='0') {
      nextState.schoolError = true
      this.setState(nextState)
      return false
    }
    nextState.schoolError = false
    if (!billingMethod || billingMethod==='0') {
      nextState.billError = true
      this.setState(nextState)
      return false
    }
    nextState.billError = false
    let rates = JSON.parse(JSON.stringify(rateGroups))
    for (let i=0;i<rates.length;i++) {
      if (!rates[i].price || !rates[i].pulse) {
        rates[i].error = true
        nextState.rateGroups = rates
        this.setState(nextState)
        return false
      }
      delete rates[i].error
    }
    let taps = JSON.parse(JSON.stringify(closeTapGroups))
    for (let i=0;i<taps.length;i++) {
      if (!taps[i].value) {
        taps[i].error = true
        nextState.closeTapGroups = taps
        this.setState(nextState)
        return false
      }
      if (taps[i].error) {
        delete taps[i].error
      }
    }
    this.setState(nextState)
    return true
  }
  comleteEdit = () => {
    if (!this.checkInput()) {
      return 
    }

    let {id, deviceType, originalDT, schoolId, originalSchool, checking, posting} = this.state
    if (checking || posting) {
      return
    }
    if (!(id && parseInt(deviceType, 10) === originalDT && parseInt(schoolId, 10) === originalSchool)) {
      this.checkExist(this.postInfo)
    } else {
      this.postInfo()
    }
  }
  postInfo = () => {
    if (this.state.posting) {
      return 
    }
    this.setState({
      posting: true
    })
    const rateGroups = JSON.parse(JSON.stringify(this.state.rateGroups))
    const taps = this.state.closeTapGroups.map((r) => (r.value))
    let {id, deviceType, billingMethod, schoolId} = this.state
    rateGroups.forEach((r) => {
      r.price = r.price / 100
    })
    const body = {
      rates: rateGroups,
      billingMethod: parseInt(billingMethod, 10),
      deviceType: parseInt(deviceType, 10),
      schoolId: parseInt(schoolId, 10),
      timeLimit: taps
    }
    if(id){
      body.id = parseInt(id, 10)
    }
    let resource='/api/rate/save'
    const cb = (json) => {
      this.setState({
        posting: false
      })
      if(json.error){
        Noti.hintServiceError(json.error.displayMessage)
      }else{
        /*--------redirect --------*/
        if(json.data){
          Noti.hintSuccess(this.props.history,'/device/rateSet')
        }else{
          Noti.hintServiceError()
        }        
      }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  back = () => {
    this.props.history.goBack()
  }
  add = () => {
    const rateGroups = JSON.parse(JSON.stringify(this.state.rateGroups))
    rateGroups.push({})
    this.setState({
      rateGroups: rateGroups
    })
  }
  abstract = () => {
    const rateGroups = JSON.parse(JSON.stringify(this.state.rateGroups))
    rateGroups.pop()
    this.setState({
      rateGroups: rateGroups
    })
  }
  changeBilling = (v) => {
    this.setState({
      billingMethod : v
    })
  }
  checkBilling = (v) => {
    if (!v || v==='0') {
      return this.setState({
        billError: true
      })
    }
    this.setState({
      billError: false
    })
  }
  addTime = (e) => {
    let closeTapGroups = JSON.parse(JSON.stringify(this.state.closeTapGroups))
    closeTapGroups.push({})
    this.setState({
      closeTapGroups: closeTapGroups
    })
  }
  abstractTime = (e) => {
    let closeTapGroups = JSON.parse(JSON.stringify(this.state.closeTapGroups))
    closeTapGroups.pop()
    this.setState({
      closeTapGroups: closeTapGroups
    })
  }
  changeTime = (e,i) => {
    let closeTapGroups = JSON.parse(JSON.stringify(this.state.closeTapGroups))
    closeTapGroups[i].value = parseInt(e.target.value, 10)
    this.setState({
      closeTapGroups: closeTapGroups
    }) 
  }
  checkTime = (e,i) => {
    const closeTapGroups = JSON.parse(JSON.stringify(this.state.closeTapGroups))
    if (!closeTapGroups[i].value) {
      closeTapGroups[i].error = true
      return this.setState({
        closeTapGroups: closeTapGroups
      })
    }
    closeTapGroups[i].error = false
    this.setState({
      closeTapGroups: closeTapGroups
    })
  }

  render () {
    let {id, schoolId, schoolError, deviceType, deviceTypeError, billingMethod, 
      billError, rateGroups, closeTapGroups} = this.state

    const rateItems = rateGroups&&rateGroups.map((r,i) => {
      return(
          <li className='rateSets' key={i}>
            <input type='number' className='shortInput' onChange={(e) => {this.changePrice(e,i)}} onBlur={(e) => {this.checkPrice(e,i)}} key={`input${i}`} value={r.price?r.price:''} />
            <span key={`span2${i}`}>分钱/</span>
            <input type='number' className='shortInput' onChange={(e) => {this.changePulse(e,i)}} onBlur={(e) => {this.checkPulse(e,i)}} key={`pulse${i}`} value={r.pulse?r.pulse:''} />
            <span key={`span3${i}`}>脉冲</span>
            {r.error? <span className='checkInvalid'>输入不完整</span> : null}
          </li>
      )
    })
    const tapItems = closeTapGroups&&closeTapGroups.map((r,i) => {
      return(
          <li className='rateSets' key={i}>
            <input type='number' className='shortInput' onChange={(e) => {this.changeTime(e,i)}} onBlur={(e) => {this.checkTime(e,i)}} key={`input${i}`} value={r.value?r.value:''} />
            <span key={`time${i}`}>分钟</span>
            {r.error? <span className='checkInvalid'>输入不完整</span> : null}
          </li>
      )
    })
    return (
      <div className='infoList rateInfo'>
        <ul>
          <li>
            <p>学校:</p>
            <SchoolSelector 
                disabled={id}
                width={CONSTANTS.SELECTWIDTH}
                className={id ? 'disabled' : ''} 
                invalidTitle='选择学校' 
                selectedSchool={schoolId} 
                changeSchool={this.changeSchool} 
                checkSchool={this.checkSchool} 
            />
            {schoolError ? <span className='checkInvalid'>请选择学校！</span> : null}       
          </li>
          <li>
            <p>设备类型:</p>
              <DeviceWithoutAll 
                selectedDevice={deviceType} 
                changeDevice={this.changeDevice} 
                checkDevice={this.checkDevice} 
                disabled={id}
                width={CONSTANTS.SELECTWIDTH}
                className={id ? 'disabled' : ''} 
              />
              {deviceTypeError ? <span className='checkInvalid'>请选择设备类型！</span> : null}
          </li>
          <li>
            <p>计费方式:</p>
            <BasicSelectorWithoutAll invalidTitle='选择计费方式' staticOpts={CONSTANTS.BILLINGOPTIONS} width={CONSTANTS.SELECTWIDTH} selectedOpt={billingMethod.toString()}  changeOpt={this.changeBilling} checkOpt={this.checkBilling} />
            {billError ? <span className='checkInvalid'>请选择计费方式！</span> : null}
          </li>
          <li className='itemsWrapper'>
            <p>费率组:</p>
            <div >
              <ul>{rateItems}</ul>
              <AddPlusAbs count={rateGroups.length} add={this.add} min={deviceType === '2' ? 3 : 1} abstract={this.abstract} />
            </div>
          </li>
          <li className='itemsWrapper'>
            <p>自动关阀时间:</p>
            <div>
              <ul>{tapItems}</ul>
              <AddPlusAbs count={closeTapGroups.length} add={this.addTime} abstract={this.abstractTime} />
            </div>
          </li>
        </ul>

        <div className='btnArea'>
          <Button type='primary' onClick={this.comleteEdit} >确认</Button>
          <Button onClick={this.back} >{this.props.location.state ? BACKTITLE[this.props.location.state.path] : '返回'}</Button>

        </div>
      </div>
    )
  }
}

export default RateInfo
