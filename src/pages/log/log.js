import React from 'react'
import {Button} from 'antd'
//import Form from 'antd/lib/form'
import AjaxHandler from '../ajax'
import Noti from '../noti'
import {setToken} from '../util/handleToken'
import {setStore, getLocal} from '../util/storage'
import {clientDetect} from '../util/clientDetect'
import logLogo from '../assets/log_logo.png'
import './style/style.css'

//const Form = asyncComponent(() => import(/* webpackChunkName: "form" */ "antd/lib/form"))
//const Button = asyncComponent(() => import(/* webpackChunkName: "button" */ "antd/lib/button"))
//const Input = asyncComponent(() => import(/* webpackChunkName: "input" */ "antd/lib/input"))
//const Icon = asyncComponent(() => import(/* webpackChunkName: "icon" */ "antd/lib/icon"))
//const Checkbox = asyncComponent(() => import(/* webpackChunkName: "checkbox" */ "antd/lib/checkbox"))

class Log extends React.Component{
  state = {
    remember: true,
    mobile: '',
    mobileError: false,
    mobileErrorMsg: '',
    password: '',
    pwdError: false,
    pwdErrorMsg: '',
    posting: false
  }
  componentDidMount () {
    let mobile = getLocal('xl_mobile') || '', password = getLocal('xl_pwd') || '', nextState = {}
    if (!mobile || !password) {
      nextState.mobile = mobile
      nextState.password = password
      this.setState(nextState)
    }
  }
  changeRemember = (e) => {
    this.setState({
      remember: !this.state.remember
    })
  }
  changeMobile = (e) => {
    this.setState({
      mobile: e.target.value
    })
  }
  checkMobile = (e) => {
    let v = e.target.value.trim()
    if (!v) {
      this.setState({
        mobileError: true,
        mobileErrorMsg: '手机号不能为空'
      })
      this.refs.mobileBorder.classList.add('error')
      return
    } else if (!/^1[3|4|5|7|8][0-9]{9}$/.test(v)) {
      this.setState({
        mobileError: true,
        mobileErrorMsg: '手机号格式不正确'
      })
      this.refs.mobileBorder.classList.add('error')
      return
    } else {
      this.setState({
        mobileError: false,
        mobileErrorMsg: ''
      })
      this.refs.mobileBorder.classList.remove('error')
      this.refs.mobileBorder.classList.remove('activeBorder')
    }
  }
  changePwd = (e) => {
    this.setState({
      password: e.target.value
    })
  }
  checkPwd = (e) => {
    let v = e.target.value.trim()
    if (!v) {
      this.setState({
        pwdError: true,
        pwdErrorMsg: '密码不能为空'
      })
      this.refs.pwdBorder.classList.add('error')
      return
    } else {
      this.setState({
        pwdError: false,
        pwdErrorMsg: ''
      })
      this.refs.pwdBorder.classList.remove('error')
      this.refs.pwdBorder.classList.remove('activeBorder')
    }
  }
  focus = (e) => {
    let ref = e.target.getAttribute('data-ref')
    this.refs[ref].classList.add('activeBorder')
    /* if (ref === 'pwdBorder') {
      this.refs.pwd.type = 'password'
    } */
  }  
  handleSubmit = () => {
    let {mobile, password, posting} = this.state
    /* if (!remember) {
      this.refs.pwd.type = 'text'
      console.log(this.refs.pwd)
    } */
    if (!mobile) {
      this.setState({
        mobileError: true,
        mobileErrorMsg: '手机号不能为空'
      })
      this.refs.mobileBorder.classList.add('error')
      return
    } else if (!/^1[3|4|5|7|8][0-9]{9}$/.test(mobile)) {
      this.setState({
        mobileError: true,
        mobileErrorMsg: '手机号格式不正确'
      })
      this.refs.mobileBorder.classList.add('error')
      return
    }
    if (!password) {
      this.setState({
        pwdError: true
      })
      this.refs.pwdBorder.classList.add('error')
      return
    }

    if (posting) {
      return
    }
    this.setState({
      posting: true
    })

    const {brand, model} = clientDetect()

    const resource = '/login'
    const body = {
      mobile: parseInt(mobile, 10),
      password: password,
      system: 3, // from cmp
      brand: brand, // operating system
      model: model // browser type
    }
    const cb = (json) => {
      this.setState({
        posting: false
      })
      if (json.error) {
        // throw new Error(json.error.displayMessage||json.error.debugMessage)
        this.handleLogError(json.error)
      }else{
        let {nickName, id, pictureUrl} = json.data.user
        let user = {
          name: nickName,
          id: id,
          portrait: pictureUrl,
        }
        setToken(json.data.token)
        if (json.data.forbidden) {
          setStore('forbidden', 1)
        }
        setStore('username', nickName)
        setStore('userId', id)
        this.props.login(user)
        Noti.hintLog()
      }
    }
    AjaxHandler.ajax(resource,body,cb)
  }

  pressEnter = (e) => {
    let key = e.key
    if (key.toLowerCase() === 'enter') {
      this.handleSubmit()
    }
  }
  handleLogError = (error) => {
    let {code, displayMessage} = error
    if (code === 30004 || code === 30006) {
      this.refs.mobileBorder.classList.add('activeBorder')
      this.refs.mobileBorder.classList.add('error')
      return this.setState({
        mobileError: true,
        mobileErrorMsg: displayMessage
      })
    } else if (code === 30005) {
      this.refs.pwdBorder.classList.add('error')
      this.refs.pwdBorder.classList.add('activeBorder')
      return this.setState({
        pwdError: true,
        pwdErrorMsg: displayMessage
      })
    } else {
      Noti.hintServiceError(error.displayMessage)
    }
  }
  render(){
    let {mobile, mobileError, mobileErrorMsg, password, pwdError, pwdErrorMsg} = this.state
    /* 
      <div className='remember'>
        <p onClick={this.changeRemember}>
          <img src={remember ? rememberImg : forget} alt='remember me' />
          <span>记住我</span>
        </p>
      </div>
    */
    return (
      <div className='logForm'>
        <div className='logWrapper'>
          <section className='header'>
            <img src={logLogo} alt='logo' />
            <span className='divider'></span>
            <span className='logTitle'>登录</span>
          </section>

          <form className='logBody' >
            <div className='inputSection'>
              <p className='title'>手机号</p>
              <div className='value'>
                <input 
                  value={mobile}
                  name='username'
                  placeholder='请输入手机号' 
                  data-ref='mobileBorder' 
                  onKeyDown={this.pressEnter} 
                  onFocus={this.focus} 
                  onChange={this.changeMobile} 
                  onBlur={this.checkMobile} 
                />
                <p className='border' ref='mobileBorder'></p>
              </div>
              <p className='hint checkInvalid'>{mobileError ? mobileErrorMsg : ''}</p>
            </div>


            <div className='inputSection'>
              <p className='title'>密码</p>
              <div className='value'>
                <input 
                  ref='pwd'
                  type='password'
                  autoComplete='new-passwordxx'
                  name='pwd'
                  value={password} 
                  placeholder='请输入密码' 
                  data-ref='pwdBorder' 
                  onKeyDown={this.pressEnter}  
                  onFocus={this.focus} 
                  onChange={this.changePwd} 
                  onBlur={this.checkPwd} 
                />
                <p className='border' ref='pwdBorder'></p>
              </div>
              <p className='hint checkInvalid'>{pwdError ? pwdErrorMsg : ''}</p>
            </div>

            <div className='inputSection'>
              <Button type='primary' onClick={this.handleSubmit}>登录</Button>
            </div>
          </form>

          <section className='footer'>
            <p>笑联综合管理平台</p>
          </section>
        </div>
      </div>
    )    
  }
}

export default Log