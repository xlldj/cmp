import React from 'react'
import AjaxHandler from '../../ajax'
import { Button,Radio, Select, Modal, Table, notification } from 'antd'
import CONSTANTS from '../../component/constants'
import SchoolSelectorWithoutAll from '../../component/schoolSelectorWithoutAll'
import BasicSelectorWithoutAll from '../../component/basicSelectorWithoutAll'
import Noti from '../../noti'
import Time from '../../component/time'
const RadioGroup = Radio.Group
const Option = Select.Option
const typeName = CONSTANTS.DEPOSITACTTYPE
const deviceName = CONSTANTS.DEVICETYPE

class DepositInfo extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      id: 0,
      selectedSchool: '',
      schoolError: false,
      initialSchool: 0,
      type: '',
      typeError: false,
      name:'',
      nameError: false,      
      endTime: Date.parse(new Date()),
      endTimeError: false,
      online: '',
      onlineError: false,
      couponError: false,//if all aoupon or gift equals 0, hint error
      giftError: false,
      schools: [],
      denominations: [],
      gifts: [],
      released: false,
      showGifts: false,
      editingDenomination: ''
    }
  }
  fetchGifts = () => {
    let resource='/api/gift/list'
    const body={
      page: 1,
      size: 100
    }
    const cb = (json) => {
        if(json.error){
          throw new Error(json.error.displayMessage || json.error)
        }else{
          // this.fetchDenominations()
          if(json.data){
            this.setState({
              gifts: json.data.gifts
            })
            if(this.props.match.params.id){
              let id = parseInt(this.props.match.params.id.slice(1), 10)
              const body={
                id: id
              }
              this.setState({
                id: id
              })
              this.fetchData(body)
            } 
          }else{
            throw new Error('网络出错，请稍后重试～')
          }        
        }
    }
    AjaxHandler.ajax(resource,body,cb)    
  }
  fetchDenominations = () => {
    let resource='/recharge/denomination/list'
    const body={
      page: 1,
      size: 100,
      schoolId: parseInt(this.state.selectedSchool, 10)
    }
    const cb = (json) => {
        if(json.error){
          throw new Error(json.error.displayMessage || json.error)
        }else{
          /*--------redirect --------*/
          if(json.data){
            let items =  json.data.rechargeDenominations && json.data.rechargeDenominations[0] && json.data.rechargeDenominations[0].items
            if (!items || items.length < 1) {
              return this.setState({
                schoolError: true,
                schoolErrorMessage: '当前学校还未添加充值面额，请先添加充值面额再添加活动～',
                denominations: []
              })
            }
            let d = items // 这是该学校全部的充值面额
            let g = JSON.parse(JSON.stringify(this.state.gifts))
            g.map((item,i) => {
              return item.count = 0
            })
            let denos = d.map((deno,index) => {
              let newGifts = JSON.parse(JSON.stringify(g))
              let item = {
                amount: deno
              }
              item.coupon = ''
              item.giftCount = 0
              item.gifts = newGifts
              return item
            })
            let oldDenos = this.state.denominations //查看当前是否已经有充值数据(编辑时), 有则添加入denominations
            if (oldDenos.length > 0) {
              let type = parseInt(this.state.type, 10)
              if (type === 1) {
                oldDenos.forEach((old) => {
                  //编辑时设置了优惠面额的项在全部面额中的对应项
                  let theDeno = denos.find((each) => (each.amount === old.denomination))
                  if (theDeno) {
                    theDeno.coupon = old.realAmount
                  }
                })
              } else {
                oldDenos.forEach((old) => {
                  //编辑时设置了优惠面额的项在全部面额中的对应项
                  let theDeno = denos.find((each) => (each.amount === old.denomination))
                  if (theDeno) {
                    theDeno.giftCount = old.realAmount
                    // old.gifts是之前在fetchData时获取的数据，它的红包id是'giftId'
                    // theDeno.gifts是上面为每个deno添加的从/gift/list拉到的数据，它的红包id字段是'id'
                    old.gifts.forEach((g, ind) => {
                      let newGift = theDeno.gifts.find((gift) => (gift.id === g.giftId))
                      if (newGift) {
                        newGift.count = g.quantity
                      }
                    })
                  }
                })
              }
            }
            this.setState({
                denominations: denos
              }
            )
          }else{
            throw new Error('网络出错，请稍后重试～')
          }        
        }
    }
    AjaxHandler.ajax(resource,body,cb)
  }   
  fetchData = (body) => {
    let resource='/api/deposit/activity/details'
    const cb = (json) => {
      if(json.error){
        throw new Error(json.error.displayMessage || json.error)
      }else{
        if(json.data){
          let d = json.data
          // let denos = JSON.parse(JSON.stringify(this.state.denominations))//this is the denominations for update state.denominations
          let newState = {}//this is the state for update
          newState.selectedSchool = d.schoolId.toString()
          newState.initialSchool = d.schoolId
          newState.name = d.name
          newState.type = d.type.toString()
          newState.endTime = d.endTime
          if(d.online===2){
            newState.released = false
            newState.online = false
          }else{
            newState.released = true
            newState.online = true
          }
          /*
          let items = d.items//this is the original denominations array
          if(d.type===1){
            items.map((r,i) => {
              let id = r.denominationId
              let deno = denos.find((d,i)=>(d.id === id))
              deno&&(deno.coupon = r.realAmount)//if DEPOSIT, only set coupon to realAmount
            })
          }else{
            items.map((r,i)=>{
              let id = r.denominationId
              let deno = denos.find((d,ind)=>(d.id === id))
              deno&&(deno.giftCount = r.realAmount)
              r.gifts.map((gift,ind)=>{
                let g = deno&&deno.gifts.find((item,i)=>(item.id===gift.giftId))
                g&&(g.count = gift.quantity)//if gift, set gift quantity
              })
            })
          }
          */
          newState.denominations = d.items
          this.setState(newState)
          this.fetchDenominations()
        }else{
          throw new Error('网络出错，请稍后重试～')
        }        
      }
    }
    AjaxHandler.ajax(resource,body,cb)
  }  
  componentDidMount(){
    this.props.hide(false)
    // this.fetchSchools()
    this.fetchGifts()
  }
  componentWillUnmount () {
    this.props.hide(true)
  }

  handleBack = () => {
    this.props.history.push('/fund/deposit')
  }
  back = () => {
    this.props.history.push('/fund/deposit')
  }
  changeSchool = (v) => {
    this.setState({
      selectedSchool: v
    })
    if (!v) {
      return this.setState({
        schoolError: true,
        schoolErrorMessage: '学校不能为空！'
      })
    }
    if (this.state.schoolError) {
      this.setState({
        schoolError: false
      })
    }
    this.checkExist(v, this.fetchDenominations)
    // this.fetchDenominations()
  }
  // checkSchool is not used any more
  checkSchool = (v) => {
    if(this.state.schoolError){
      this.setState({
        schoolError: false,
        schoolErrorMessage: ''
      })
    }
    if (this.state.id && this.state.initialSchool === parseInt(this.state.selectedSchool)) {
      this.fetchDenominations()
    } else {
      this.checkExist(v, null)
    }
  }
  checkExist = (schoolId, callback) => {
    let resource = '/deposit/activity/check'
    const body = {
      schoolId: parseInt(schoolId, 10)
    }
    const cb = (json) => {
        if(json.error){
          throw new Error(json.error.displayMessage || json.error)
        }else{
          if(json.data.result){
            Noti.hintLock('请求出错', '当前学校已有充值活动，请勿重复添加')
            this.setState({
              schoolError: true,
              schoolErrorMessage: '该学校已有充值活动，请勿重复添加！'
            })
          }else{
            if(this.state.schoolError){
              this.setState({
                schoolError: false,
                schoolErrorMessage: ''
              })
            }
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
  checkName =(e) => {
    let v = e.target.value.trim()
    let nextState = {
      name: v
    }
    if(!v){
      nextState.nameError = true
    }
    if(this.state.nameError){
      nextState.nameError = false
    }    
    this.setState(nextState)
  } 
  changeType = (v) => {
    this.setState({
      type: v
    })
  } 
  checkType = (v) => {
    if(!v || v=== '0'){
      return this.setState({
        typeError: true
      })
    }
    if(this.state.typeError){
      this.setState({
        typeError: false
      })
    }
  }
  changeDenos = (e,i) => {
    let denos = JSON.parse(JSON.stringify(this.state.denominations))
    denos[i].coupon = e.target.value
    this.setState({
      denominations:denos
    })
  }
  checkCoupon = () => {
    if(!this.checkCoupons()){
      return this.setState({
        couponError: true
      })
    }
    if(this.state.couponError){
      this.setState({
        couponError: false
      })
    }
  }
  checkCoupons = () => {
    let d = this.state.denominations,count=0
    d.map((r,i) => {
      if(r.coupon){
        count++
      }
    })
    if(!count){
      return false
    }
    return true
  }
  checkGifts = () => {
    let d = this.state.denominations,count=0
    d.map((r,i) => {
      count+=r.giftCount
    })
    if(!count){
      return false
    }
    return true
  }
  handleSubmit = () => {
    /*-------------need to check the data here---------------*/
    if(!parseInt(this.state.selectedSchool)){
      return this.setState({
        schoolError: true,
        schoolErrorMessage: '学校不能为空！'
      })
    }
    if (this.state.schoolError) {
      return //当学校错误提示时，拒绝提交。而只要学校切换了，就会对是否为空/重复/有无充值面额进行检查，因此此处设置就完整了。
    }
    if(!this.state.name){
      return this.setState({
        nameError: true
      })
    }   
    if(!this.state.type){
      return this.setState({
        typeError: true
      })
    }
    if(!this.state.endTime){
      return this.setState({
        endTimeError: true
      })
    }
    if(this.state.type==='1'){
      if(!this.checkCoupons()){
        return this.setState({
          couponError: true
        })
      }
    }else{
      if(!this.checkGifts()){
        return this.setState({
          giftError: true
        })
      }
    }
    if(this.state.online===''){
      return this.setState({
        onlineError: true
      })
    }
    if (this.state.id && this.state.initialSchool === parseInt(this.state.selectedSchool)) {
      this.postInfo()
    } else {
      this.checkExist(this.state.selectedSchool, this.postInfo)
    }
  }
  postInfo = () => {
    if(this.state.released&&this.state.online){
      return this.props.history.push('/fund/deposit')
    }
    let url = '/api/deposit/activity/save'
    let denos = this.state.denominations,type=this.state.type,items=[]
    denos.forEach((r,i)=>{
      if(type==='1'){
         if(r.coupon){
          items.push({
            denomination:r.amount,
            realAmount:parseFloat(r.coupon)
          })  
        } 
      }else{
        //check if needs to set realAmount
        if(r.giftCount){
          let gifts = []
          r.gifts.map((g,i)=>{
            if(g.count){
              gifts.push({
                giftId: g.id,
                quantity: g.count
              })
            }
          }) 
          items.push({
            denomination: r.amount,
            gifts: gifts,
            realAmount: r.giftCount
          })         
        }
      }
    })
    let end = new Date(this.state.endTime).getTime()
    const body = {
      endTime: end,
      items:items,
      name: this.state.name,
      online: this.state.online,
      schoolId: parseInt(this.state.selectedSchool, 10),
      type: parseInt(this.state.type, 10)
    }
    if(this.props.match.params.id){
      body.id = parseInt(this.props.match.params.id.slice(1))
    }
    const cb = (json) => {
        if(json.error){
          throw new Error(json.error.displayMessage || json.error)
        }else{
            if(json.data){
              if(this.state.released&&!this.state.online){
                this.openNotificationWithIcon('info')
                this.setState({
                  released: false
                })
              }else{
                if(this.state.online){
                   this.openNotification()
                }else{
                   this.props.history.push('/fund/deposit')
                }
              }
            }else{
              throw new Error('网络出错，请稍后重试～')
            }
        }
    }
    AjaxHandler.ajax(url, body, cb)   
  }
  openNotification = () => {
    notification.open({
      message: '当前活动已上线',
      description: '将返回活动列表！',
      duration: 2,
      onClose: ()=>{
        this.props.history.push('/fund/deposit')
      }
    })
  }
  openNotificationWithIcon = (type) => {
    notification['info']({
      message: '当前活动已下线',
      description: '您可以对此活动继续编辑！',
      duration: 2
    })
  }  
  changeEndTime = (e) => {
    let t = new Date(e.target.value)
    this.setState({
      endTime: t
    })
  }
  checkEndTime = (e) => {
    let t=e.target.value
    if(!t){
      return this.setState({
        endTimeError: true
      })
    }
    if(this.state.endTimeError){
      this.setState({
        endTimeError: false
      })
    }
  }
  chooseGifts = (e,i) => {
    e.preventDefault()
    this.setState({
      editingDenomination: i,
      showGifts: true
    })
  }
  setGift = (gifts,total) => {
    let denos = JSON.parse(JSON.stringify(this.state.denominations)), deno = denos[this.state.editingDenomination]
    deno.giftCount = total
    gifts.map((g,i) => {
      if(g.count){
        let editGift = deno.gifts.find((r,i) => (r.id === g.id))
        editGift.count = g.count
      }
    })
    this.setState({
      denominations: denos
    })
  }
  closeModal = () => {
    this.setState({
      showGifts: false
    })
  }  
  changeOnline = (v) => {
    let onlineO = {
      online: v.target.value
    }
    if(this.state.onlineError){
      onlineO.onlineError=false
    }
    this.setState(onlineO)
  }
  checkOnline = (v) => {
    this.setState({
      onlineError: false
    })
  }
  cancelSubmit = () => {
    this.props.history.push('/fund/deposit')
  }
  render () {
    let {id, schools, selectedSchool,name,type,nameError,typeError,schoolError,denominations,gifts, editingDenomination, endTime,online,onlineError,couponError,endTimeError,giftError,released, schoolErrorMessage} = this.state
    let endTimeStr = Time.getDayFormat(endTime)
    let hasDenomination = denominations && denominations.length > 0

    const depositPanel = (denominations.length>0)&&denominations.map((r,i)=>(
      <div key={i}>
        <span className='giftCount'>¥{r.amount}</span> ———— <span className='beforeInput'>实际售价(¥):</span>
        <input disabled={released?true:false} type='number' min='0' max='500' style={{width:100}} value={r.coupon} onChange={(e) => (this.changeDenos(e,i))} onBlur={this.checkCoupon} />
      </div>
    ))

    const giftPanel = (denominations.length>0)&&denominations.map((r,i) => (
      <div key={i} >
        <span className='giftCount'>¥{r.amount}</span> ———— <span className='beforeInput'>赠送红包:</span>
        <span className='giftHint'>{r.giftCount?`已选${r.giftCount}个红包`:'未选择'}</span>
        <a className='chooseGift' disabled={released?true:false} href='' onClick={(e)=>(this.chooseGifts(e,i))} >选择红包</a>
      </div>
    ))

    //this is the editing denomination passed to modal
    let gifts2modal = editingDenomination!==''?denominations[editingDenomination].gifts:gifts
    let total = editingDenomination!==''?denominations[editingDenomination].giftCount:0

    return (
      <div className='infoList depositInfo'>
        <ul>
          <li>
            <p>学校名称:</p>
            <SchoolSelectorWithoutAll 
              disabled={id ? true : false}
              className={id ? 'disabled' : ''}
              width={CONSTANTS.SELECTWIDTH}
              selectedSchool={selectedSchool}
              changeSchool={this.changeSchool}
            />
            {schoolError?(<span className='checkInvalid'>{schoolErrorMessage}</span>):null}
          </li>
          <li>
            <p>活动名称:</p>
            <input disabled={released?true:false} 
              className={released ? 'disabled' : ''} value={name}  onChange={this.changeName} onBlur={this.checkName} placeholder="" /> 
            {nameError?(<span className='checkInvalid'>活动名称不能为空！</span>):null}
          </li>        
          <li>
            <p>活动类型:</p>
            <BasicSelectorWithoutAll
              staticOpts={CONSTANTS.DEPOSITACTTYPE}
              invalidTitle='选择活动类型'
              className={released ? 'disabled' : ''}
              disabled={released?true:false}
              width={CONSTANTS.SELECTWIDTH}
              selectedOpt={type}
              changeOpt={this.changeType}
              checkOpt={this.checkType}
            />
            {typeError?(<span className='checkInvalid'>请选择活动类型！</span>):null}
          </li>
          {
            hasDenomination && type && selectedSchool ? 
              (type==='1' ?
                <li className='itemsWrapper'>
                  <p>充值面额:</p>
                  <div>{depositPanel}</div>
                </li>
              :
                <li className='itemsWrapper'>
                  <p>充值面额:</p>
                  <div>{giftPanel}</div>
                </li>
              ) 
            : null 
          }
          {hasDenomination && selectedSchool && type==='1' && couponError ? <li ><p></p><span className='checkInvalid'>请选择优惠面额！</span></li> : null}  
          {hasDenomination && selectedSchool && type==='2' && giftError ? <li ><p></p><span className='checkInvalid'>请选择红包！</span></li> : null}       

          {hasDenomination && selectedSchool && type ? <li>
            <p>活动截止日期:</p>
            <input disabled={released?true:false} 
              className={released ? 'disabled' : ''} name='endTime' type='date' value={endTimeStr} onChange={this.changeEndTime} onBlur={this.checkEndTime} required />
            {endTimeError?(<span className='checkInvalid'>请选择截止日期！</span>):null}
          </li> : null}

          {hasDenomination && selectedSchool && type ? <li>
            <p>活动是否上线:</p>
            <RadioGroup  onChange={this.changeOnline} value={online}>
              <Radio value={true}>是</Radio>
              <Radio value={false}>否</Radio>
            </RadioGroup>
            {released?<span className='checkInvalid'>上线活动不能编辑，请您先将活动下线！</span>:null}
            {onlineError?<span className='checkInvalid'>请选择上下线状态！</span>:null}
          </li>
          : null }
          
        </ul>

        {hasDenomination && selectedSchool && type ? <div className='btnArea'>*充值面额未设置的则不在本次活动范围内</div> : null }
        {hasDenomination && selectedSchool && type ? <div className='btnArea'>
            <Button type='primary' onClick={this.handleSubmit} >确认</Button>
            <Button onClick={this.cancelSubmit} >返回</Button>   
          </div>
        : null }

        <div>
          <GiftTable closeModal={this.closeModal} setGift={this.setGift} showModal={this.state.showGifts} confirm={this.confirm} total={total}  gifts={JSON.parse(JSON.stringify(gifts2modal))} />
        </div>

      </div>
    )
  }
}

class GiftTable extends React.Component{
  constructor(props){
    super(props)
    let dataSource = [],allTypeData = JSON.parse(JSON.stringify(dataSource)), selectedDevice='all'
    this.state = {
      allTypeData,
      dataSource,
      selectedDevice,
      total: 0
    }
  }
  componentWillReceiveProps(nextProps){
    if(JSON.stringify(nextProps.gifts)!==JSON.stringify(this.props.gifts)){
      let data = JSON.parse(JSON.stringify(nextProps.gifts))
      if(data.length>0){
        data.map((r,i)=> {
          if(!r.count){
            r.count = 0
          }
        })
        this.setState({
          allTypeData:JSON.parse(JSON.stringify(data)),
          dataSource:data,
          total: data.amount?data.amount:0
        })
      }
    }
    if(nextProps.total !== this.props.total){
      this.setState({
        total: nextProps.total
      })
    }
  }
  confirm = () => {
    this.props.closeModal()
    this.props.setGift(JSON.parse(JSON.stringify(this.state.dataSource)),this.state.total)
  }
  changeDevice = (v) => {

    let data = JSON.parse(JSON.stringify(this.state.allTypeData))
    if(v==='all'){
        return this.setState({
                  dataSource: data,
                  selectedDevice: 'all'
                })      
    }
    let newData = data.filter((r,i)=>(r.deviceType===v))
    this.setState({
      dataSource: newData,
      selectedDevice: v
    })
  }
  add = (e,i) => {
    let gifts = JSON.parse(JSON.stringify(this.state.dataSource)),total=this.state.total, all=JSON.parse(JSON.stringify(this.state.allTypeData)), editingGift = all.filter((r,ind)=>(r.id===gifts[i].id))
    editingGift[0].count++
    gifts[i].count++
    total++
    this.setState({
      allTypeData: all,
      dataSource: gifts,
      total:total
    })
  }
  minus = (e,i) => {
    let gifts = JSON.parse(JSON.stringify(this.state.dataSource)),total=this.state.total
    gifts[i].count--
    total--
    this.setState({
      dataSource: gifts,
      total:total
    })
  }
  cancel = () => {
    //clear all the data
    let all = JSON.parse(JSON.stringify(this.state.allTypeData))
    all.map((r,i)=>{
      r.count = 0
    })
    this.setState({
      allTypeData: all,
      dataSource: JSON.parse(JSON.stringify(all)),
      total: 0
    })
    this.props.closeModal()
  }
  render(){
    const {dataSource,total} = this.state

    let ds = Object.keys(deviceName)
    const deviceOptions = ds.map((d,i) => (
      <Option style={{textAlign:'center'}} value={d} key={d}>{deviceName[d]}</Option>
    ))

    const columns = [{
      title: (<div style={{textAlign:'center'}}>
                <Select value={this.state.selectedDevice} onChange={this.changeDevice} >
                  <Option style={{textAlign:'center'}}  value='all'>全部类型</Option>
                  {deviceOptions}
                </Select>
              </div>
      ),
      width: '25%',
      dataIndex: 'deviceType',
      render: (text,record,index) => (deviceName[record.deviceType]),
      className: 'center'
    }, {
      title: (<p style={{textAlign:'center'}}>红包名称</p>),
      dataIndex: 'name',
      width: '18%',
      className: 'center'
    }, {
      title: (<p style={{textAlign:'center'}}>红包金额</p>),
      dataIndex: 'amount',
      width: '15%',
      render: (text) => (`¥${text}`),
      className: 'center'
    }, {
      title: (<p style={{textAlign:'center'}}>使用期限（领取日起）</p>),
      dataIndex: 'timeLimit',
      render: (text, record) => {
        if (record.type === 1) {
          return (
            <span>{Time.showDate(record.startTime)}~{Time.showDate(record.endTime)}</span>
          )
        } else {
          return (
            <span>{record.timeLimit}天</span>
          )
        }
      },
      className: 'center'
    },{
      title: (<p style={{textAlign:'center'}}>操作</p>),
      dataIndex: 'operation',
      width: '20%',
      render: (text, record, index) => (
        <div style={{textAlign:'center'}} className='editable-row-operations optInDeposit'>
            <div >
              {dataSource[index].count>0?<Button onClick={(e)=> (this.minus(e,index))} type='primary' size='small' >-</Button>:null}
            </div>
            <div className='giftCount'>{record.count}</div>
            <Button onClick={(e)=> (this.add(e,index))} type='primary' size='small' >+</Button>
        </div>
      )
    }]
    return (
      <Modal wrapClassName='modal' width={800} title='' visible={this.props.showModal} onCancel={this.cancel} onOk={this.confirm} okText='' footer={null}>
        <div className='giftStatus'>
          <p>当前已经选中<span>{this.state.total}</span>个红包</p>
          <Button type='primary' onClick={this.confirm} >确定</Button>
        </div>
        <div className='depositGiftTable'>
          <Table rowKey={record=>record.id}  pagination={false} dataSource={dataSource} columns={columns} />
        </div>
      </Modal>
    )
  }
}
export default DepositInfo
