import React from 'react'
import { Button} from 'antd'
import AjaxHandler from '../../ajax'
import Noti from '../../noti'
import CONSTANTS from '../../component/constants'
import AuthenDataTable from '../../component/authenDataTable'
import {buildRealAuthen, buildAuthenDataForServer} from '../../util/authenDataHandle'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeEmployee, setAuthenData } from '../../../actions'

class RoleInfo extends React.Component {
  static propTypes = {
    full: PropTypes.array.isRequired
  }
  constructor (props) {
    super(props)
    this.state = {
      id: '',
      checking: false,
      posting: false,
      authenStatus: CONSTANTS.authenData
    }
  }
  fetchData = (body) => {
    let resource='/api/role/one'
    const cb = (json) => {
      try {
        if(json.data){
          let {previleges} = json.data
          let authenStatus = buildRealAuthen(this.props.full, previleges)
          this.setState({
            authenStatus: authenStatus 
          })
        }  
      } catch (e) {
        console.log(e)
      }     
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  componentDidMount () {
    console.log(this.props.full)
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
  back = () => {
    this.props.history.goBack()
  }
  postData = () => {
    let {id, authenStatus, posting} = this.state
    if (posting) {
      return
    }
    this.setState({
      posting: true
    })
    let resource
    let previleges = buildAuthenDataForServer(this.props.full, authenStatus)
    const body={
      previleges: previleges
    }
    if(id){
      body.id = id
      resource ='/api/role/update'
    }else{
      resource = '/api/role/add'
    }
    const cb = (json) => {
      try {
        this.setState({
          posting: false
        })
        if (json.data.result) {
          Noti.hintSuccess(this.props.history,'/employee/role')
        } else {
          Noti.hintWaring(null, json.data.failReason || '添加出错，请稍后重试')
        }
      } catch (e) {
        console.log(e)
      }     
    }
    AjaxHandler.ajax(resource,body,cb, null, {clearPosting: true, thisObj: this})
  }
  confirm = () => {
    let {id, checking, posting} = this.state
    if (checking || posting) {
      return
    }
    if (id) {
      this.postData()
    } else {
      this.checkExist(this.postData)
    }
  }
  checkExist = (callback) => {
    let {checking, name} = this.state
    if (checking) {
      return
    }
    this.setState({
      checking: true
    })
    let resource = '/api/role/check'
    const body = {
      name: name
    }
    const cb = (json) => {
      const nextState = {
        checking: false
      }
      if (json.data.result) {
        Noti.hintWaring('', '该身份已存在于系统中!')
      } else {
        if (callback) {
          callback()
        }
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb, null, {clearChecking: true, thisObj: this})
  }
  changeName = (e) => {
    this.setState({
      name: e.target.value
    })
  }
  checkName = (e) => {
    let m = e.target.value.trim()
    if (!m) {
      return this.setState({
        name: m,
        nameError: true
      })
    } else {
      this.setState({
        name: m,
        nameError: false
      })
    }
  }
  setAuthenStatus = (status) => {
    this.setState({
      authenStatus: JSON.parse(JSON.stringify(status))
    })
  }
  render () {
    const {id, name, nameError, authenStatus} = this.state

    return (
      <div className='infoList roleInfo'>
        <ul>
          <li>
            <p>身份名称:</p>
            <input 
              disabled={id}
              className={id ? 'disabled' : ''} 
              onChange={this.changeName} 
              onBlur={this.checkName}
              value={name} 
            />
            { nameError ? <span className='checkInvalid'>名称不能为空！</span> : null }
          </li>
          <li className='itemsWrapper'>
            <p>权限设置:</p>
          </li>
          <li className='itemsWrapper'>
            <AuthenDataTable
              clickable={true}
              authenStatus={authenStatus}
              setStatus={this.setAuthenStatus}
            />
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


const mapStateToProps = (state, ownProps) => ({
  full: state.setAuthenData.full
})

export default withRouter(connect(mapStateToProps, {
 changeEmployee,
 setAuthenData 
})(RoleInfo))
