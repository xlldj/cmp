import React from 'react'
import {Button, Popconfirm, Modal} from 'antd'
import Noti from '../noti'
import AjaxHandler from '../ajax'
import CONSTANTS from '../component/constants'
import Bread from '../bread'
import './style/style.css'
const ROLE = CONSTANTS.ROLE

class AccountInfo extends React.Component{
  constructor (props) {
    super(props)
    this.state = {
      mobile:'',
      nickName:'',
      type:'',
      visible: false,
      oldPwd: '',
      oldPwdError: false,
      new1: '',
      new1Error: false,
      new2: '',
      new2Error: false,
      modalError: false
    }
  }
  fetchData = (body) => {
    let resource='/api/employee/one'
    const cb = (json) => {
        if(json.error){
          throw new Error(json.error.displayMessage || json.error)
        }else{
          /*--------redirect --------*/
          if(json.data){
            this.setState({
              mobile:json.data.mobile,
              nickName:json.data.nickName,
              type:json.data.type
            })
          }else{
            throw new Error('网络出错，请稍后重试～')
          }        
        }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  componentDidMount(){
    this.props.hide(false)
    const body={
      id:parseInt(this.props.user.id, 10)
    }
    this.fetchData(body)
  }
  componentWillUnmount () {
    // this.props.hide(true)
  }

  changePwd = (e)=>{
    e.preventDefault()
    this.setState({
      visible: true
    })
  }
  logout=()=>{
    this.props.logout()
    this.props.history.push('/')
  }
  cancel = () => {
    this.setState({
      visible: false
    })
  }
  changePassport = () => {
    let {new1, new2, oldPwd} = this.state
    if (!new1 || !new2 || !oldPwd) {
      return this.setState({
        modalError: true
      })
    }
    if (new1 === new2 && new1 !== oldPwd) {
      this.postPwd()
      if (this.state.modalError) {
        this.setState({
          modalError: false
        })
      }
    } else {
      this.setState({
        modalError: true
      })
    }
  }
  postPwd = () => {
    let resource = '/user/password/update'
    const body = {
      newPassword: this.state.new1,
      oldPassword: this.state.oldPwd
    }
    const cb = (json) => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        Noti.hintOk('密码重置成功', '您可以继续其他操作')
        this.setState({
          visible: false
        })
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  changeOldPwd = (e) => {
    this.setState({
      oldPwd: e.target.value
    })
  }
  checkOldPwd = () => {
    if (!this.state.oldPwd) {
      return this.setState({
        oldPwdError: true
      })
    }
    this.setState({
      oldPwdError: false
    })
  }
  changeNew1 = (e) => {
    this.setState({
      new1: e.target.value
    })
  }
  checkNew1 = () => {
    if (!this.state.new1) {
      return this.setState({
        new1Error: true
      })
    }
    this.setState({
      new1Error: false
    })
  }
  changeNew2 = (e) => {
    this.setState({
      new2: e.target.value
    })
  }
  checkNew2 = () => {
    if (!this.state.new2) {
      return this.setState({
        new2Error : true
      })
    }
    this.setState({
      new2Error : false
    })
  }

  render(){
    let {mobile,type,nickName} = this.state
    return (
      <div>
        <div className='breadc'>
          <Bread parent='account' parentName='账号信息' />
        </div>

        <div className='disp'>
          <div className='infoList accountInfo'>
            <ul>
              <li>
                <p>员工手机号:</p>
                {mobile}
              </li>
              <li>
                <p>登录密码:</p>
                <a href='#' onClick={this.changePwd}>更改密码</a>
              </li>
              <li>
                <p>员工姓名:</p>
                {nickName}
              </li>
              <li>
                <p>员工身份:</p>
                {ROLE[type]}
              </li>
            </ul>
            <div className='btnArea'>
              <Popconfirm title="确定要退出么?" onConfirm={this.logout} onCancel={this.cancel} okText="确认" cancelText="取消">
                <Button type='primary'>退出登录</Button>
              </Popconfirm>
            </div>

            <div>
              <Modal
                title="修改密码"
                visible={this.state.visible}
                onOk={this.changePassport}
                onCancel={this.cancel}
                maskClosable={false}
                className='addSupplierModal'
              >
                <div style={{marginBottom: '10px'}}>
                  <label >请输入旧密码：<input style={{width:'60%',height:'30px',marginLeft:'20px'}} type='password' value={this.state.oldPwd} onChange={this.changeOldPwd} onBlur={this.checkOldPwd} /></label>
                  {this.state.oldPwdError ? <span className='checkInvalid'>请输入旧密码</span> : null}
                </div>
                <div style={{marginBottom: '10px'}}>
                  <label >请输入新密码：<input style={{width:'60%',height:'30px',marginLeft:'20px'}} type='password' value={this.state.new1} onChange={this.changeNew1} onBlur={this.checkNew1} /></label>
                  {this.state.new1Error ? <span className='checkInvalid'>请输入旧密码</span> : null}
                </div>
                <div style={{marginBottom: '10px'}}>
                  <label >再输入新密码：<input style={{width:'60%',height:'30px',marginLeft:'20px'}} type='password' value={this.state.new2} onChange={this.changeNew2} onBlur={this.checkNew2} /></label>
                  {this.state.new2Error ? <span className='checkInvalid'>请输入旧密码</span> : null}
                </div>
                { this.state.modalError ? <span className='checkInvalid'>密码输入错误，请再次核对！</span> : null}
              </Modal>
            </div>

          </div>
        </div>
      </div>
    )
  }
}

export default AccountInfo
