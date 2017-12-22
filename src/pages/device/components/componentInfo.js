import React from 'react'

import {Button} from 'antd'

import Noti from '../../noti'
import AjaxHandler from '../../ajax'
import BasicSelectorWithoutAll from '../../component/basicSelectorWithoutAll'
import DeviceWithoutAll from '../../component/deviceWithoutAll'


class ComponentInfo extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      id: 0,
      model: '',
      deviceType: 0,
      componentType: 0,
      componentTypes: {},
      dtError: false, 
      ctError: false,
      modelError: false
    }
  }
  fetchData = (id) => {
    let resource = '/api/device/component/one'
    const body = {
      id: id
    }
    const cb=(json)=>{
      if (json.data) {
        this.setState({
          id: json.data.id,
          model: json.data.model,
          deviceType: json.data.deviceType.toString(),
          componentType: json.data.typeId.toString()
        })
        this.fetchComponentTypes(json.data.deviceType)
      }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  fetchComponentTypes = (deviceType) => {
    let resource = '/api/device/component/type/list'
    const body = {
      page: 1,
      size: 100,
      deviceType: deviceType
    }
    const cb=(json)=>{
      if(json.data) {
        let componentTypes = {}
        json.data.componentTypes.forEach((r, i)=>{
          componentTypes[r.id] = r.description
        })
        this.setState({
          componentTypes: componentTypes
        })
      }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  componentDidMount(){
    this.props.hide(false)
    let id = this.props.match.params.id
    if(id) {
      this.fetchData(parseInt(id.slice(1), 10))
    }
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  back = () => {
    this.props.history.goBack()
  }

  changeDeviceType = (value) => {
    this.setState({
      deviceType: value,
      componentType: 0 // clear componentType as device Type changes
    })
    this.fetchComponentTypes(parseInt(value, 10))
  }
  checkDevice = (v) => {
    if (!v || v==='0') {
      return this.setState({
        dtError: true
      })
    }
    this.setState({
      dtError: false
    })
  }

  changeComponentType = (value) => {
    this.setState({
      componentType: value
    })
  }
  checkCpType = (value) => {
    if (value === '0' || !value) {
      return this.setState({
        ctError: true
      })
    }
    this.setState({
      ctError: false
    })
  }
  postData = () => {
    let {model,deviceType,componentType} = this.state
    let resource
    const body={
      model: model,
      typeId: parseInt(componentType, 10),
      deviceType: parseInt(deviceType, 10)
    }
    let id = this.props.match.params.id
    if (id) {
      body.id = parseInt(id.slice(1), 10)
      resource ='/api/device/component/update'
    } else {
      resource = '/api/device/component/add'
    }
    const cb = (json) => {
      if (json.data) {
        if(json.data){
          Noti.hintSuccess(this.props.history,'/device/components')
        }else{
          throw new Error('网络出错，请稍后重试～')
        }        
      }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  confirm = () => {
    let m = this.state.deviceType
    if(m === '0' || !m){
      return this.setState({
        dtError: true
      })
    }
    let x = this.state.componentType
    if(x === '0' || !x){
      return this.setState({
        ctError: true
      })
    }
    let n = this.state.model
    if(!n){
      return this.setState({
        modelError: true
      })
    }
    this.postData()
  }
  changeModel = (e) => {
    this.setState({
      model: e.target.value
    })
  }
  checkModel = (e) => {
    let v = e.target.value.trim()
    if(!v){
      return this.setState({
        model: v,
        modelError: true
      })
    } 
    this.setState({
      model: v,
      modelError: false
    })
  }
  render () {
    let {id, componentTypes, deviceType, componentType, model, dtError, ctError, modelError} = this.state
 
    return (
      <div className='infoList'>
        <ul>
          <li>
            <p>设备类型:</p>
            <span>
              <DeviceWithoutAll 
                selectedDevice={deviceType} 
                width={'140px'} 
                changeDevice={this.changeDeviceType} 
                checkDevice={this.checkDevice}
                disabled={id ? true : false}
                className={id ? 'disabled' : ''}
              />
            </span>
            <span className='errorHint'>{dtError?'请选择正确的设备类型！':''}</span>
          </li>
          <li>
            <p>零件类型:</p>
            <BasicSelectorWithoutAll 
                disabled={id ? true : false}
                className={id ? 'disabled' : ''}
                invalidTitle='选择类型' width={140} staticOpts={componentTypes} selectedOpt={componentType} changeOpt={this.changeComponentType} checkOpt={this.checkCpType} />
            <span className='errorHint'>{ctError?'请选择正确的零件类型！':''}</span>
          </li>  
          <li>
            <p>配件型号:</p>
            <input className='value' onChange={this.changeModel} onBlur={this.checkModel} value={model} />
            <span className='errorHint'>{modelError?'型号不能为空！':''}</span>
          </li>
        </ul>
        <div className='btnArea'>
          <Button type='primary' onClick={this.confirm}>确认</Button>
          <Button onClick={this.back}>返回</Button>
        </div>
        <div style={{clear:'both'}}></div>
      </div>
    )
  }
}

export default ComponentInfo
