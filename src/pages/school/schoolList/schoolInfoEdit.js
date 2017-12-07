import React from 'react'

import AjaxHandler from '../../ajax'
import { Map, Marker } from 'react-amap';
import Noti from '../../noti'
import AddPlusAbs from '../../component/addPlusAbs'
import PicturesWall from '../../component/picturesWall'

import Cascader from 'antd/lib/cascader'
import Button from 'antd/lib/button'
import Radio from 'antd/lib/radio'
import CONSTANTS from '../../component/constants'

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
  constructor (props) {
    super(props)
    this.state = {
      name: '',
      nameError: false,
      nameErrorMessage: '',
      city: ['浙江','杭州'],
      cityError: false,
      
      tradeAccounts: [
        {
          name: '',
          type: ''
        }
      ],
      accountError: false,
      accountErrorInfo: '请核查账号！',
      typeErrorInfo: '请选择账号类型',

      location: '',
      searchAddr: '',
      locationError: false,
      lnglat:{longitude: 120, latitude: 30},
      fileList: [],
      id: 0,
      initialName: 0
    }
  }
  fetchData = (body) => {
    let resource = '/api/school/one'
    const cb = (json) => {
      if(json.error){
        throw new Error(json.error)
      }else{
        let {name,city,tradeAccounts,location,lon,lat,logo} = json.data
        let nextState = {
          name: name,
          city: city.split('-'),
          tradeAccounts: tradeAccounts,
          location: location,
          lnglat:{longitude: lon, latitude: lat},
          initialName: name
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
        id: this.props.match.params.id.slice(1)
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
    /*--------note need tell node.js is update or add,we can judge it from props.selectedSchoolId---------*/
    let url = '/api/school/save'
    const tradeAccounts = JSON.parse(JSON.stringify(this.state.tradeAccounts))
    const {location} = this.state
    const body = {
      tradeAccounts: tradeAccounts,
      city: this.state.city.join('-'),
      lat: this.state.lnglat.latitude,
      lon: this.state.lnglat.longitude,
      name: this.state.name,
      location: location
    }
    if(this.state.fileList.length>0 && this.state.fileList[0].url){
      body.logo = this.state.fileList[0].url.replace(FILEADDR, '')
    }
    if(this.state.id){
      body.id = parseInt(this.state.id, 10)
    }
    const cb = (json) => {
        if(json.error){
          throw new Error(json.error.displayMessage || json.error)
        }else{
          /*--------redirect --------*/
          if(json.data){
            Noti.hintSuccess(this.props.history,'/school')
          }          
        }
    }
    AjaxHandler.ajax(url, body, cb)   
  }

  handleSubmit = () => {
    /*-------------need to check the data here---------------*/
    let {id, name, initialName} = this.state, tradeAccounts = JSON.parse(JSON.stringify(this.state.tradeAccounts)), nextState = {}
    if(!name){
      nextState.nameError = true
      nextState.nameErrorMessage = '学校名字不能为空'
      return this.setState(nextState)
    }
    for (let i=0;i<tradeAccounts.length;i++) {
      let {name, type} = tradeAccounts[i]
      if (!name) {
        tradeAccounts[i].accountError = true
        nextState.tradeAccounts = tradeAccounts
        return this.setState(nextState)
      }
      if (!type) {
        tradeAccounts[i].typeError = true
        nextState.tradeAccounts = tradeAccounts
        return this.setState(nextState)
      }
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
      console.log(json)
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
  changeAccount = (e,index) => {
    const tradeAccounts = JSON.parse(JSON.stringify(this.state.tradeAccounts))
    tradeAccounts[index].name = e.target.value
    this.setState({
      tradeAccounts: tradeAccounts
    })
  }
  checkAccount = (e,index) => {
    let v= e.target.value.trim(), tradeAccounts = JSON.parse(JSON.stringify(this.state.tradeAccounts))
    let account = tradeAccounts[index]
    account.name = v
    if(!v){
      account.accountError = true
      return this.setState({
        tradeAccounts: tradeAccounts
      })
    }
    if(account.accountError){
      account.accountError = false
    }
    this.setState({
      tradeAccounts: tradeAccounts
    })
  }
  changeType = (e,index) => {
    const tradeAccounts = JSON.parse(JSON.stringify(this.state.tradeAccounts))
    tradeAccounts[index].type = parseInt(e.target.value, 10)
    let nextState = {}
    nextState.tradeAccounts = tradeAccounts
    if (tradeAccounts[index].typeError) {
      tradeAccounts[index].typeError = false
    }
    this.setState(nextState)
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
  render () {
    const {id, tradeAccounts, fileList, accountErrorInfo, typeErrorInfo} = this.state

    const accountItems = tradeAccounts&&tradeAccounts.map((record,index)=>{
      return (
        <div key={index}>
          <input 
            key={`input${index}`} 
            onChange={(e)=>{this.changeAccount(e,index)}} 
            onBlur={(e)=>{this.checkAccount(e,index)}} 
            value={record.name}
            className='longInput'
          />
          <RadioGroup 
            key={`radio${index}`} 
            onChange={(e)=>{this.changeType(e,index)}} 
            value={record.type} 
            className='accountType'
          >
            <Radio value={1}>支付宝</Radio>
            <Radio value={2}>微信</Radio>
          </RadioGroup> 
          {record.accountError?(<span className='checkInvalid'>{accountErrorInfo}</span>):null}
          {record.typeError?(<span className='checkInvalid'>{typeErrorInfo}</span>):null}
        </div>
      )
    })

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
            <input pattern={/\S+/} onChange={this.changeName} disabled={id ? true : false} className={id ? 'disabled' : ''} id='name' name='name' value={this.state.name} onBlur={this.checkName} />
            {this.state.nameError?(<span className='checkInvalid'>{this.state.nameErrorMessage}</span>):null}
          </li>

          <li>
            <p>所在城市：</p>
            <Cascader value={this.state.city} className='citySelect' options={options} onChange={this.changeCity} placeholder="请选择城市" /> 
          </li>        

          <li className='itemsWrapper'>
            <p>收款账号：</p>
            <div>
              {accountItems}
              {this.state.accountError?(<span className='checkInvalid'>{this.state.accountErrorInfo}</span>):null}
              <AddPlusAbs count={tradeAccounts.length||1} add={this.add} abstract={this.abstract} />
            </div>
          </li>
          <li>
            <p>学校位置：</p>
            <input 
              onKeyDown={this.enterSearch} 
              className='longInput' 
              onChange={this.setLocation} 
              onBlur={this.checkLocation} 
              name='location' 
              value={this.state.location} 
            />
            <Button type='primary' className='confirmSearch' onClick={this.changeLoc} >确认</Button>
          </li>    
          <li className='imgWrapper'>
            <p></p>
            <Loc setLngLat={this.setLngLat} searchAddr={this.state.searchAddr} lnglat={this.state.lnglat} />
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

export default SchoolInfoEdit
