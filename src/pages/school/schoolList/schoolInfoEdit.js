import React from 'react'

import AjaxHandler from '../../ajax'
import { Map, Marker } from 'react-amap';
import Noti from '../../noti'
import PicturesWall from '../../component/picturesWall'

import Cascader from 'antd/lib/cascader'
import Button from 'antd/lib/button'
import Radio from 'antd/lib/radio'
import CONSTANTS from '../../component/constants'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { setSchoolList } from '../../../actions'

const FILEADDR = CONSTANTS.FILEADDR
const RadioGroup = Radio.Group;

const options = [{
  value: '浙江',
  label: '浙江',
  children: [{
    value: '杭州',
    label: '杭州'
  }]
}, {
  value: '湖北',
  label: '湖北',
  children: [{
    value: '武汉',
    label: '武汉'
  }]
}, {
  value: '江西',
  label: '江西',
  children: [{
    value: '南昌',
    label: '南昌'
  }]
}, {
  value: '河南',
  label: '河南',
  children: [{
    value: '郑州',
    label: '郑州'
  }]
}, {
  value: '山东',
  label: '山东',
  children: [{
    value: '济南',
    label: '济南'
  }]
}]

class Loc extends React.Component {
  constructor(){
    super();
    const _this = this;
    this.map = null;
    this.marker = null;
    this.geocoder = null;
    this.mapEvents = {
      created(map){
        _this.map = map;
         window.AMap.plugin('AMap.Geocoder',() => {
          _this.geocoder = new window.AMap.Geocoder({
          });
         })
      }
    };
    this.markerEvents = {};
    this.state = {
      position: {longitude: 120, latitude: 30},
      zoom: 10
    }
  }
  componentWillReceiveProps(nextProps){
    if(this.props.searchAddr!==nextProps.searchAddr){
      this.geocoder && this.geocoder.getLocation(nextProps.searchAddr, (status, result) => {
            if (status === 'complete' && result.info === 'OK') {
                this.props.setLngLat({
                  longitude: result.geocodes[0].location.lng,
                  latitude: result.geocodes[0].location.lat
                })
                this.setState({
                  position: {longitude: result.geocodes[0].location.lng,latitude: result.geocodes[0].location.lat},
                  zoom: 13
                })
            }
      })
    }
    if(this.props.lnglat.longitude !== nextProps.lnglat.longitude || this.props.lnglat.latitude !== nextProps.lnglat.latitude){
      this.setState({
        position: nextProps.lnglat
      })
    }
  }
  render(){
    return (
      <div className='mapContainer'>
        <Map className='map' zoom={this.state.zoom} center={this.state.position} events={this.mapEvents}>
          <Marker position={this.state.position} events={this.markerEvents}  />
        </Map>
      </div>
    )

  }
}

class SchoolInfoEdit extends React.Component {
  static propTypes = {
    schools: PropTypes.array.isRequired
  }
  constructor (props) {
    super(props)
    this.state = {
      name: '',
      nameError: false,
      nameErrorMessage: '',
      city: ['浙江','杭州'],
      cityError: false,

      location: '',
      searchAddr: '',
      locationError: false,
      lnglat:{longitude: 120, latitude: 30},
      fileList: [],
      id: 0,
      initialName: 0,

      accountName: '',
      accountNameError: false,
      accountNameErrorMsg: '',

      accountType: 1,

      appId: '',
      appIdError: false,
      appIdErrorMsg: 'app_id不能为空！',

      pid: '',
      pidError: false,
      pidErrorMsg: 'pid不能为空！',

      appPrivateKey: '',
      appPrivateKeyError: false,
      appPrivateKeyErrorMsg: 'app_private_key不能为空！',

      appPublicKey: '',
      appPublicKeyError: false,
      appPublicKeyErrorMsg: 'app_public_key不能为空！',

      alipayPublicKey: '',
      alipayPublicKeyError: false,
      alipayPublicKeyErrorMsg: 'alipay_public_key不能为空！',

      accountComplete: false,
      accountEditing: true,
      validateSuccess: false,
      validateFailure: false,

      checking: false,

      posting: false,
      serverResponsed: false,
      serverReloaded: false,
      clientResponsed: false,
      clientReloaded: false,

      initialAccount: false // when edit a school info, show the account info has not been changed
    }
  }
  fetchData = (body) => {
    let resource = '/api/school/one'
    const cb = (json) => {
      if(json.error){
        Noti.hintServiceError(json.error.displayMessage)
      }else{
        let {name,city,location,lon,lat,logo, accountName, accountType} = json.data
        let nextState = {
          name: name,
          city: city.split('-'),
          location: location,
          lnglat:{longitude: lon, latitude: lat},
          initialName: name,
          accountName: accountName || 1,
          accountType: accountType || 1,
          appId: '********',
          pid: '********',
          appPrivateKey: '********',
          appPublicKey: '********',
          alipayPublicKey: '********'
        }
        if(logo){
          nextState.fileList = [
            {
              uid: -9,
              url: FILEADDR + logo,
              status: 'done'
            }
          ]
        }
        nextState.accountEditing = false
        nextState.validateSuccess = true
        nextState.initialAccount = true
        this.setState(nextState)
      }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  componentDidMount(){
    this.props.hide(false)
    /*----------fetch after mount , avoid state chaos-------------------------------------------------------------*/
    /*----------if params.id exists, this is a edit ,else is a add----------*/
    if(this.props.match.params.id){
      let body = {
        id: parseInt(this.props.match.params.id.slice(1), 10)
      }
      this.fetchData(body)
      this.setState({
        id: parseInt(this.props.match.params.id.slice(1), 10)
      })
    }
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  postInfo = () => {
    let {id, name,  city, lnglat, location, accountName, accountType, posting, 
      appId, pid, appPrivateKey, appPublicKey, alipayPublicKey
    } = this.state
    if (posting) {
      return
    }
    this.setState({
      posting: true
    })

    let url = '/school/save'
    const body = {
      name: name,
      city: city.join('-'),
      lat: lnglat.latitude,
      lon: lnglat.longitude,
      location: location,
      accountName: accountName,
      accountType: accountType,
      appId: appId,
      pid: pid,
      appPrivateKey: appPrivateKey,
      appPublicKey: appPublicKey,
      alipayPublicKey: alipayPublicKey
    }
    if(this.state.fileList.length>0 && this.state.fileList[0].url){
      body.logo = this.state.fileList[0].url.replace(FILEADDR, '')
    }
    if (id) {
      body.id = parseInt(id, 10)
    }
    const cb = (json) => {
      this.setState({
        posting: false
      })
      if (json.error) {
        Noti.hintServiceError(json.error.displayMessage)
      } else {
        /* tell server to reload account */
        if(json.data){
          // Noti.hintSuccess(this.props.history,'/school')
          let school = {
            id: json.data.id,
            name: name
          }
          this.addSchoolToReducer(school)
          this.tellServerReload()
          this.tellClientReload()
        } else {
          Noti.hintServiceError()
        }
      }
    }
    AjaxHandler.ajax(url, body, cb)   
  }

  addSchoolToReducer = (school) => {
    let {schools} = this.props
    schools.push(school)
    this.props.setSchoolList({schools})
  }

  clearReloadStatus = () => {
    this.setState({
      posting: false,
      serverResponsed: false,
      serverReloaded: false,
      clientResponsed: false,
      clientReloaded: false
    })
  }

  tellServerReload = () => {
    let resource = '/alipay/trade/client/reload'
    const body = null
    const cb = (json) => {
      const nextState = {
        serverResponsed: true
      }
      let {clientResponsed, clientReloaded} = this.state
      if (json.data.result) {
        nextState.serverReloaded = true
        if (clientResponsed) {
          nextState.posting = false
          if (clientReloaded) {
            this.hintSuccess()
          } else {
            this.clearReloadStatus()
            Noti.hintServiceError('学校账号绑定未完成，请稍后点击确认重试或联系相关人员咨询～')
          }
        }
      } else {
        if (clientResponsed) {
          this.clearReloadStatus()
          Noti.hintServiceError('学校账号绑定未完成，请稍后点击确认重试或联系相关人员咨询～')
        }
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb)
  }

  tellClientReload = () => {
    let resource = '/alipay/trade/client/reload'
    const body = null
    const cb = (json) => {
      const nextState = {
        clientResponsed: true
      }
      let {serverResponsed, serverReloaded} = this.state
      if (json.data.result) {
        nextState.clientReloaded = true
        if (serverResponsed) {
          if (serverReloaded) {
            this.hintSuccess()
          } else {
            this.clearReloadStatus()
            Noti.hintServiceError('学校账号绑定未完成，请稍后点击确认重试或联系相关人员咨询～')
          }
        }
      } else {
        if (serverResponsed) {
            this.clearReloadStatus()
            Noti.hintServiceError('学校账号绑定未完成，请稍后点击确认重试或联系相关人员咨询～')
        }
      }
      this.setState(nextState)
    }
    AjaxHandler.ajaxClient(resource, body, cb)
  }
  hintSuccess = () => {
    this.clearReloadStatus()
    Noti.hintSuccess(this.props.history,'/school')
  }

  handleSubmit = () => {
    /*-------------need to check the data here---------------*/
    let {id, name, initialName, city, location, accountName, appId, pid, appPrivateKey, appPublicKey, alipayPublicKey, validateSuccess} = this.state, nextState = {}
    if(!name){
      nextState.nameError = true
      nextState.nameErrorMessage = '学校名字不能为空'
      return this.setState(nextState)
    }
    if (!city) {
      nextState.cityError = true
      return this.setState(nextState)
    }
    if (!location) {
      nextState.locationError = true
      return this.setState(nextState)
    }
    if (!accountName) {
      nextState.accountNameError = true
      nextState.accountNameErrorMsg = '学校账号不能为空'
      return this.setState(nextState)
    }
    if (!appId) {
      nextState.appIdError = true
      nextState.appIdErrorMsg = 'app_id不能为空！'
      return this.setState(nextState)
    }
    if (!pid) {
      nextState.pidError = true
      nextState.pidErrorMsg = 'pid不能为空！'
      return this.setState(nextState)
    }
    if (!appPrivateKey) {
      nextState.appPrivateKeyError = true
      nextState.appPrivateKeyErrorMsg = 'app_private_key不能为空！'
      return this.setState(nextState)
    }
    if (!appPublicKey) {
      nextState.appPublicKeyError = true
      nextState.appPublicKeyErrorMsg = 'app_public_key不能为空！'
      return this.setState(nextState)
    }
    if (!alipayPublicKey) {
      nextState.alipayPublicKeyError = true
      nextState.alipayPublicKeyErrorMsg = 'alipay_public_key不能为空！'
      return this.setState(nextState)
    }
    /* 验证未通过，不予处理 */
    if (!validateSuccess) {
      return Noti.hintWarning('', '请先验证收款账号再提交！')
    }

    if (id && initialName === name ) {
      this.postInfo()
    } else {
      this.checkExist(this.postInfo)
    }
  }
  changeName = (e) => {
    this.setState({
      name: e.target.value
    })
  }
  checkName =(e) => {
    let v = e.target.value.trim()
    if(!v){
      return this.setState({
        name: v,
        nameError: true,
        nameErrorMessage: '学校名称不能为空'
      })
    }
    let nextState = {name: v}
    if(this.state.nameError){
      nextState.nameError = false
      nextState.nameErrorMessage = ''
    }
    this.setState(nextState)
    if (this.state.id && this.state.initialName === e.target.value ) {
      return 
    } else {
      this.checkExist(null)
    }
  }
  checkExist = (callback) => {
    let url='/api/school/check'
    const body = {
      name: this.state.name
    }
    const cb = (json) => {
        if(json.error){
          throw new Error(json.error.displayMessage || json.error)
        }else{
          if(!json.data){
            Noti.hintOccupied()
            this.setState({
              nameError: true,
              nameErrorMessage: '学校名称已被占用'
            })
          }else{
            if(this.state.nameError){
              this.setState({
                nameError: false,
                nameErrorMessage: ''
              })
            }
            if (callback) {
              callback()
            }
          }
        }
    }
    AjaxHandler.ajax(url, body, cb)  
  }
  setLocation = (e) => {
    this.setState({
      location: e.target.value
    })
  }
  checkLocation = (e) => {
    let v = e.target.value.trim(), location = this.state.location
    if (v !== location) {
      this.setState({
        location: v
      })
    }
  }
  setLngLat = (l) => {
    this.setState({
      lnglat: l
    })
  }
  changeCity = (v) => {
    this.setState({
      city: v
    })
  }
  changeLoc = (e) => {
    let addr = this.state.location
    this.setState({
      searchAddr: addr
    })
  }
  enterSearch = (e) => {
    let k = e.key.toLowerCase()
    if(k.toLowerCase() === 'enter'){
      this.changeLoc()
    }
  }
  handleBack = () => {
    this.props.history.push('/school/list')
  }
  add = () => {
    const tradeAccounts = JSON.parse(JSON.stringify(this.state.tradeAccounts))
    tradeAccounts.push({})
    this.setState({
      tradeAccounts: tradeAccounts
    })
  }
  abstract = () => {
    const tradeAccounts = JSON.parse(JSON.stringify(this.state.tradeAccounts))
    tradeAccounts.pop()
    this.setState({
      tradeAccounts: tradeAccounts
    })
  }
  setImages = (fileList) => {
    this.setState({
      fileList: JSON.parse(JSON.stringify(fileList))
    })
  }
  changeAccount = (e) => {
    this.setState({
      accountName: e.target.value
    })
    let state = {
      accountName: e.target.value
    }
    if (this.checkAccountComplete(state)) {
      this.setState({
        accountComplete: true
      })
    } else if (this.state.accountComplete) {
      this.setState({
        accountComplete: false
      })
    }
    if (this.state.validateFailure) {
      this.setState({
        validateFailure: false
      })
    }
  }
  checkAccount = (e) => {
    let v = e.target.value
    if (!v) {
      return this.setState({
        accountNameError: true,
        accountName: v,
        accountNameErrorMsg: '学校账号不能为空'
      })
    }

    let {accountNameError} = this.state
    const nextState = {
      accountName: v,
      accountNameErrorMsg: ''
    }
    if (accountNameError) {
      nextState.accountNameError = false
    }
    this.setState(nextState)
  }
  checkAccountComplete = (state) => {
    let {accountName, pid, appId, appPrivateKey, appPublicKey, alipayPublicKey} = {...this.state, ...state}
    if (accountName && pid && appId && appPrivateKey && appPublicKey && alipayPublicKey) {
      return true
    } else {
      return false
    }
  }
  changeAppId = (e) => {
    this.setState({
      appId: e.target.value
    })
    let state = {
      appId: e.target.value
    }
    if (this.checkAccountComplete(state)) {
      this.setState({
        accountComplete: true
      })
    } else if (this.state.accountComplete) {
      this.setState({
        accountComplete: false
      })
    }
    if (this.state.validateFailure) {
      this.setState({
        validateFailure: false
      })
    }
  }
  checkAppId = (e) => {
    let v = e.target.value
    if (!v) {
      return this.setState({
        appIdError: true,
        appId: v,
        appIdErrorMsg: 'appId不能为空'
      })
    }
    let {appIdError} = this.state
    const nextState = {
      appId: v,
      appIdErrorMsg: ''
    }
    if (appIdError) {
      nextState.appIdError = false
    }
    this.setState(nextState)
  }
  changePid = (e) => {
    this.setState({
      pid: e.target.value
    })
    let state = {
      pid: e.target.value
    }
    if (this.checkAccountComplete(state)) {
      this.setState({
        accountComplete: true
      })
    } else if (this.state.accountComplete) {
      this.setState({
        accountComplete: false
      })
    }
    if (this.state.validateFailure) {
      this.setState({
        validateFailure: false
      })
    }
  }
  checkPid = (e) => {
    let v = e.target.value
    if (!v) {
      return this.setState({
        pidError: true,
        pid: v,
        pidErrorMsg: 'pid不能为空'
      })
    }
    let {pidError} = this.state
    const nextState = {
      pid: v,
      pidErrorMsg: ''
    }
    if (pidError) {
      nextState.pidError = false
    }
    this.setState(nextState)
  }
  changePrivateKey = (e) => {
    this.setState({
      appPrivateKey: e.target.value
    })
    let state = {
      appPrivateKey: e.target.value
    }
    if (this.checkAccountComplete(state)) {
      this.setState({
        accountComplete: true
      })
    } else if (this.state.accountComplete) {
      this.setState({
        accountComplete: false
      })
    }
    if (this.state.validateFailure) {
      this.setState({
        validateFailure: false
      })
    }
  }
  checkPrivateKey = (e) => {
    let v = e.target.value
    if (!v) {
      return this.setState({
        appPrivateKeyError: true,
        appPrivateKey: v,
        appPrivateKeyErrorMsg: 'app_private_key不能为空'
      })
    }
    let {appPrivateKeyError} = this.state
    const nextState = {
      appPrivateKey: v,
      appPrivateKeyErrorMsg: ''
    }
    if (appPrivateKeyError) {
      nextState.appPrivateKeyError = false
    }
    this.setState(nextState)
  }
  changePublicKey = (e) => {
    this.setState({
      appPublicKey: e.target.value
    })
    let state = {
      appPublicKey: e.target.value
    }
    if (this.checkAccountComplete(state)) {
      this.setState({
        accountComplete: true
      })
    } else if (this.state.accountComplete) {
      this.setState({
        accountComplete: false
      })
    }
    if (this.state.validateFailure) {
      this.setState({
        validateFailure: false
      })
    }
  }
  checkPublicKey = (e) => {
    let v = e.target.value
    if (!v) {
      return this.setState({
        appPublicKeyError: true,
        appPublicKey: v,
        appPublicKeyErrorMsg: 'app_public_key不能为空'
      })
    }
    let {appPublicKeyError} = this.state
    const nextState = {
      appPublicKey: v,
      appPublicKeyErrorMsg: ''
    }
    if (appPublicKeyError) {
      nextState.appPublicKeyError = false
    }
    this.setState(nextState)
  }
  changeAlipayPublicKey = (e) => {
    this.setState({
      alipayPublicKey: e.target.value
    })
    let state = {
      alipayPublicKey: e.target.value
    }
    if (this.checkAccountComplete(state)) {
      this.setState({
        accountComplete: true
      })
    } else if (this.state.accountComplete) {
      this.setState({
        accountComplete: false
      })
    }
    if (this.state.validateFailure) {
      this.setState({
        validateFailure: false
      })
    }
  }
  checkAlipayPublicKey = (e) => {
    let v = e.target.value
    if (!v) {
      return this.setState({
        alipayPublicKeyError: true,
        alipayPublicKey: v,
        alipayPublicKeyMsg: 'alipay_public_key不能为空'
      })
    }
    let {alipayPublicKeyError} = this.state
    const nextState = {
      alipayPublicKey: v,
      alipayPublicKeyErrorMsg: ''
    }
    if (alipayPublicKeyError) {
      nextState.alipayPublicKeyError = false
    }
    this.setState(nextState)
  }
  
  validateAccount = () => {
    let {accountEditing, accountComplete, appId, pid, appPrivateKey, appPublicKey, alipayPublicKey, checking} = this.state
    if (!accountComplete || !accountEditing || checking) {
      return
    }
    this.setState({
      checking: true
    })

    let resource = '/alipay/trade/verification'
    const body = {
      appId: appId,
      pid: pid,
      appPrivateKey: appPrivateKey,
      appPublicKey: appPublicKey,
      alipayPublicKey: alipayPublicKey
    }
    const cb = (json) => {
      const nextState = {
        checking: false
      }
      if (json.error) {
        Noti.hintServiceError(json.error.displayMessage)
      } else if (json.data) {
        if (json.data.result) {
          nextState.validateSuccess = true
          nextState.accountEditing = false
        } else {
          nextState.validateFailure = true
        }
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  editAccount = () => {
    /* 置位validateSuccess, validateFailure, accountComplete, accountEditing, 以及账户相关信息 */
    const nextState = {
      accountEditing: true,
      validateSuccess: false,
      validateFailure: false,
      accountComplete: false,
      accountName: '',
      pid: '',
      appId: '',
      appPrivateKey: '',
      appPublicKey: '',
      alipayPublicKey: ''
    }
    if (this.state.initialAccount) {
      nextState.initialAccount = false
    }
    this.setState(nextState)
  }
  render () {
    const {id, name, nameError, nameErrorMessage, fileList, city, cityError, location, locationError, searchAddr, lnglat,
      accountName, accountNameError, accountNameErrorMsg, 
      accountType, 
      appId, appIdError, appIdErrorMsg,
      pid, pidError, pidErrorMsg,
      appPrivateKey, appPrivateKeyError, appPrivateKeyErrorMsg,
      appPublicKey, appPublicKeyError, appPublicKeyErrorMsg,
      alipayPublicKey, alipayPublicKeyError, alipayPublicKeyErrorMsg,
      accountComplete, accountEditing, validateSuccess, validateFailure,
      initialAccount
   } = this.state


    return (
      <div className='infoList schoolInfoEdit'>
        <ul>
          <li className='imgWrapper'>
            <p htmlFor='logo' className='schLabel'>学校LOGO：</p>
            <span className='noPadding'>
              <PicturesWall limit={1} setImages={this.setImages} fileList={fileList} dir='school-logo' /> 
            </span>
          </li>
          <li>
            <p>学校名称：</p>
            <input pattern={/\S+/} onChange={this.changeName} disabled={id ? true : false} className={id ? 'disabled' : ''} id='name' name='name' value={name} onBlur={this.checkName} />
            {nameError?(<span className='checkInvalid'>{nameErrorMessage}</span>):null}
          </li>

          <li>
            <p>所在城市：</p>
            <Cascader value={city} allowClear={false} className='citySelect' options={options} onChange={this.changeCity} placeholder="请选择城市" /> 
            {cityError ? <span className='checkInvalid'>请选择所在城市</span> : null}
          </li>        

          <li>
            <p>学校位置：</p>
            <input 
              onKeyDown={this.enterSearch} 
              className='longInput' 
              onChange={this.setLocation} 
              onBlur={this.checkLocation} 
              name='location' 
              value={location} 
            />
            <Button type='primary' className='confirmSearch' onClick={this.changeLoc} >确认</Button>
            {locationError ? <span className='checkInvalid'>学校位置不能为空</span> : null}
          </li>    
          <li className='imgWrapper'>
            <p></p>
            <Loc setLngLat={this.setLngLat} searchAddr={searchAddr} lnglat={lnglat} />
          </li>

          
          <li>
            <p>收款账号:</p>
            <input 
              disabled={accountEditing ? false : true}
              className={accountEditing ? 'longInput' : 'longInput disabled'}
              onChange={this.changeAccount} 
              onBlur={this.checkAccount} 
              value={accountName}
            />
            <RadioGroup 
              value={accountType} 
              className='accountType'
            >
              <Radio value={1}>支付宝</Radio>
            </RadioGroup> 
            {accountNameError?(<span className='checkInvalid'>{accountNameErrorMsg}</span>):null}
          </li>

          {
            accountType === 1 ?
              <li>
                <p>app_id:</p>
                <input
                  disabled={accountEditing ? false : true}
                  onChange={this.changeAppId} 
                  onBlur={this.checkAppId} 
                  value={appId}
                  className={accountEditing ? 'longInput' : 'longInput disabled'}
                />
                {appIdError?(<span className='checkInvalid' >{appIdErrorMsg}</span>):null}
              </li>
            : null
          }
          {
            accountType === 1 ?
              <li>
                <p>pid:</p>
                <input 
                  onChange={this.changePid} 
                  onBlur={this.checkPid} 
                  value={pid}
                  disabled={accountEditing ? false : true}
                  className={accountEditing ? 'longInput' : 'longInput disabled'}
                />
                {pidError?(<span className='checkInvalid'>{pidErrorMsg}</span>):null}
              </li>
            : null
          }
          {
            accountType === 1 ?
              <li >
                <p >app_private_key:</p>
                <input 
                  onChange={this.changePrivateKey} 
                  onBlur={this.checkPrivateKey} 
                  value={appPrivateKey}
                  disabled={accountEditing ? false : true}
                  className={accountEditing ? 'longInput' : 'longInput disabled'}
                />
                {appPrivateKeyError ? (<span className='checkInvalid' >{appPrivateKeyErrorMsg}</span>) : null}
              </li>
            : null
          }
          {
            accountType === 1 ?
              <li>
                <p >app_public_key:</p>
                <input 
                  onChange={this.changePublicKey} 
                  onBlur={this.checkPublicKey} 
                  value={appPublicKey}
                  disabled={accountEditing ? false : true}
                  className={accountEditing ? 'longInput' : 'longInput disabled'}
                />
                {appPublicKeyError? (<span className='checkInvalid'>{appPublicKeyErrorMsg}</span>) : null}
              </li>
            : null
          }
          {
            accountType === 1 ?
              <li >
                <p >alipay_public_key:</p>
                <input 
                  onChange={this.changeAlipayPublicKey} 
                  onBlur={this.checkAlipayPublicKey} 
                  value={alipayPublicKey}
                  disabled={accountEditing ? false : true}
                  className={accountEditing ? 'longInput' : 'longInput disabled'}
                />
                {alipayPublicKeyError ? (<span className='checkInvalid' >{alipayPublicKeyErrorMsg}</span>) : null}
              </li>
            : null
          }
          <li>
            <p></p>
              <Button type='primary' className={accountComplete && accountEditing ? '' : 'disabled'} onClick={this.validateAccount}>验证支付宝账号</Button>
              <Button type='primary' className={validateSuccess ? '' : 'disabled'} onClick={this.editAccount} >编辑支付宝账号</Button>
              {validateSuccess && !initialAccount ? <span className='checkInvalid'>验证通过，该支付宝账号可用</span> : null}
              {validateFailure ? <span className='checkInvalid'>验证失败，该支付宝账号不可用</span> : null}
          </li>

        </ul>

        <div className='btnArea'>
          <Button type='primary' onClick={this.handleSubmit} >确认</Button> 
          <Button onClick={this.handleBack} >返回</Button>   
        </div>

      </div>
    )
  }
}

// export default SchoolInfoEdit

const mapStateToProps = (state, ownProps) => {
  return {
    schools: state.setSchoolList.schools,
  }
}

export default withRouter(connect(mapStateToProps, {
  setSchoolList 
})(SchoolInfoEdit))