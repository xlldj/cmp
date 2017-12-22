import React from 'react'
import {Button, Popconfirm, Checkbox} from 'antd'
import Noti from '../../noti'
import AjaxHandler from '../../ajax'

const CheckboxGroup = Checkbox.Group;

class SchoolBusiness extends React.Component{
  constructor (props) {
    super(props)
    this.state = {
      businesses:[],
      id: 0,
      schoolName: '',
      clearError: false,
      posting: false
    }
  }
  fetchData = (body) => {
    let resource='/api/school/business/list'
    const cb = (json) => {
        if(json.error){
          throw new Error(json.error.displayMessage || json.error)
        }else{
          /*--------redirect --------*/
          if(json.data){
            this.setState({
              businesses: json.data.businesses
            })
          }       
        }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  componentDidMount(){
    this.props.hide(false)
    let id = parseInt(this.props.match.params.id.slice(1), 10)
    this.setState({
      id: id
    })
    const body={
      id: id
    }
    this.fetchData(body)
    this.fetchSchoolInfo(body)
  }
  componentWillUnmount () {
    this.props.hide(true)
  }

  fetchSchoolInfo = (body) => {
    let resource = '/school/one'
    const cb = (json) => {
      if(json.error){
        throw new Error(json.error)
      }else{
        this.setState({
          schoolName: json.data.name
        })
      }
    }
    AjaxHandler.ajax(resource,body,cb)
  }  

  changeBusiness = (v)=>{
    let nextState = {}
    if (v.length === 0) {
      return this.setState({
        clearError: true
      })
    } else if (this.state.clearError) {
      nextState.clearError = false
    }
    nextState.businesses = v
    this.setState(nextState)
  }
  confirm=()=>{
    let {businesses, posting} = this.state
    if (posting) {
      return
    }

    if (businesses.length === 0) {
      return this.setState({
        clearError: true
      })
    }
    this.setState({
      posting: true
    })
    let resource='/api/school/business/save'
    const body={
      schoolId: this.state.id,
      businesses: JSON.parse(JSON.stringify(this.state.businesses))
    }
    const cb=(json)=>{
      this.setState({
        posting: false
      })
      if(json.error){
        Noti.hintServiceError(json.error.displayMessage)
      }else{
        // 确认
        if (this.props.location.state && this.props.location.state.path) {
          Noti.hintSuccessAndBack(this.props.history)
        } else {
          Noti.hintSuccess(this.props.history,'/school/list')
        }
      }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  back=()=>{
    this.props.history.goBack()
  }

  render(){
    let {businesses, schoolName, clearError, posting} = this.state
    console.log(posting)
    return (
      <div className='infoList'>
        <ul>
          <li>
            <p>当前管理学校:</p>
            {schoolName}
          </li>
          <li className=''>
            <p>功能入口设置:</p>
            <CheckboxGroup value={businesses} onChange={this.changeBusiness} >
              <Checkbox value={1}>热水器</Checkbox>
              <Checkbox value={2}>饮水机</Checkbox>
            </CheckboxGroup>
            {
              clearError ? <span className='checkInvalid' >功能入口不能为空！</span> : null
            }
          </li>
        </ul>
        <div className='btnArea'>
          { posting ?
              <Button type='primary'>确认</Button>
            :
              <Popconfirm title="确定要添加么?" onConfirm={this.confirm} onCancel={this.cancel} okText="确认" cancelText="取消">
                <Button type='primary'>确认</Button>
              </Popconfirm>
          }
          <Button onClick={this.back}>{(this.props.location.state && this.props.location.state.path === 'fromInfoSet') ? '返回学校信息设置' : '返回'}</Button>
        </div>
      </div>
    )
  }
}

export default SchoolBusiness
