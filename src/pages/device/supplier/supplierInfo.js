import React from 'react'

import {Button} from 'antd'

import AjaxHandler from '../../ajax'
import Noti from '../../noti'
import AddPlusAbs from '../../component/addPlusAbs'
import CONSTANTS from '../../component/constants'
import SchoolSelector from '../../component/schoolSelectorWithoutAll'
import DeviceWithouAll from '../../component/deviceWithoutAll'
const BACKTITLE = {
  fromInfoSet: '返回学校信息设置'
}
const initialItems = [{prepay: ''}]
const initialDrinkItems =[[{prepay: '', usefor: 1}],[{prepay: '', usefor: 2}],[{prepay: '', usefor: 3}]]

class SupplierInfo extends React.Component {
  constructor (props) {
    super(props)
    this.state = { 
      id: 0,
      name: '',
      nameError: false,
      alias: '',
      aliasError: false,
      version: '',
      versionError: false
    }
  }
  fetchData =(body)=>{
    let resource='/supplier/query/one'
    const cb=(json)=>{
      if(json.error){
        throw new Error(json.error.displayMessage || json.error)
      }else{
        if(json.data){
          let {id, name, alias, version} = json.data
          let nextState={
            id: id,
            name: name,
            alias: alias
          }
          if (version) {
            nextState.version = version
          }
          this.setState(nextState)
        }else{
          throw new Error('网络出错，获取数据失败，请稍后重试～')
        }        
      }
    }
    AjaxHandler.ajax(resource,body,cb)
  }

  componentDidMount(){
    this.props.hide(false)
    if(this.props.match.params.id){
      const body={
        id:parseInt(this.props.match.params.id.slice(1))
      }
      this.fetchData(body)
    }
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  completeEdit = () => {
    let {id, name, alias, version} = this.state

    const body = {
      name: name,
      alias: alias
    }
    if (version) {
      body.version = version
    }
    const resource = '/supplier/save'
    if (id){
      body.id = id
    }
    const cb = (json) => {
      if(json.error){
        throw new Error(json.error.displayMessage || json.error)
      }else{
        /*--------redirect --------*/
        if(json.data){
          Noti.hintSuccess(this.props.history,'/device/suppliers')
        }else{
          throw new Error('网络出错，请稍后重试～')
        }        
      }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  confirm = () => {
    let {id, name, alias, version} = this.state
    if (!name) {
      return this.setState({
        nameError: true
      })
    }
    /*版本号可以为空 
    if (!alias) {
      return this.setState({
        aliasError: true
      })
    }
    if (!version) {
      return this.setState({
        versionError: true
      })
    }*/
    /*
    if (!(id && originalSchool === schoolId && originalDevice === originalDevice)) {
      this.checkExist(this.completeEdit)
    } else {
      this.completeEdit()
    }
    */
    this.completeEdit()
  }
  back = () => {
    this.props.history.goBack()
  }
  /* -----需要改成对应的查重------ */
  checkExist = (callback) => {
    let dt = parseInt(this.state.deviceType, 10)
    let schoolId = parseInt(this.state.schoolId, 10)
    let resource = '/device/prepay/option/check'
    const body = {
      deviceType: dt,
      schoolId: schoolId
    }
    const cb = (json) => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        if (json.data.result) {
          // Noti.hintLock('添加出错', '当前设备已有预付选项，请返回该项编辑')
          throw {
            title: '添加出错',
            message: '当前设备已有预付选项，请返回该项编辑'
          }
        } else {
          if (callback) {
            callback()
          }
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  changeName = (e) => {
    this.setState({
      name: e.target.value
    })
  }
  checkName = (e) => {
    let v = e.target.value.trim()
    if (!v) {
      return this.setState({
        nameError: true,
        name: v
      })
    }
    let nextState = {
      name: v
    }
    if (this.state.nameError) {
      nextState.nameError = false
    }
    this.setState(nextState)
  }
  changeAlias = (e) => {
    this.setState({
      alias: e.target.value
    })
  }
  checkAlias = (e) => {
    let v = e.target.value.trim()
    if (!v) {
      return this.setState({
        aliasError: true,
        alias: v
      })
    }
    let nextState = {
      alias: v
    }
    if (this.state.aliasError) {
      nextState.aliasError = false
    }
    this.setState(nextState)
  }
  changeVersion = (e) => {
    this.setState({
      version: e.target.value
    })
  }

  render () {
    let {id, name, nameError, alias, aliasError, version, versionError} = this.state

    return (
      <div className='infoList '>
        <ul>
          <li>
            <p>供应商名称:</p>
            <input value={name} onChange={this.changeName} onBlur={this.checkName} />
            {nameError ? <span className='checkInvalid'>供应商名字不能为空！</span> : null}
          </li>
          <li>
            <p>别名:</p>
            <input value={alias} onChange={this.changeAlias} onBlur={this.checkAlias} />
            {aliasError ? <span className='checkInvalid'>别名不能为空！</span> : null}
          </li> 
          <li>
            <p>版本号:</p>
            <input value={version} onChange={this.changeVersion} />
            {versionError ? <span className='checkInvalid'>别名不能为空！</span> : null}
          </li>   
        </ul>

        <div className='btnArea'>
          <Button type='primary' onClick={this.confirm} >确认</Button>
          <Button onClick={this.back} >返回</Button>
        </div>
      </div>
    )
  }
}

export default SupplierInfo
