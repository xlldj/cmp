import React from 'react'
import { Link} from 'react-router-dom'

import {Table, Badge, Button} from 'antd'
import AjaxHandler from '../ajax'
import Time from '../component/time'
import CONSTANTS from '../component/constants'
import SearchLine from '../component/searchLine'
import DeviceSelector from '../component/deviceSelector'
import SchoolSelector from '../component/schoolSelector'
import BasicSelector from '../component/basicSelector'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeOrder } from '../../actions'

const SIZE = CONSTANTS.PAGINATION

const typeName =CONSTANTS.DEVICETYPE
const STATUS = {
  1: '使用中',
  2: '使用结束'
}
const BADGETYPE = {
  1:'warning',
  2:'success'
}
const BACKTITLE={
  fromUser:'返回用户详情',
  fromDevice:'返回设备详情'
}
/* state explanation */
/* subStartTime: 传给字组件searchLine的起始时间，因为要区分propTypes.startTime和组件弹窗中的起始时间 */
/* subStartTime: 传给字组件searchLine的截止时间 */
class OrderTable extends React.Component {
  static propTypes = {
    schoolId: PropTypes.string.isRequired,
    deviceType: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    selectKey: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired,
    startTime: PropTypes.number.isRequired,
    endTime: PropTypes.number.isRequired
  }
  constructor(props){
    super(props)
    let dataSource=[]
    this.state = {
      dataSource, 
      loading: false,
      total: 0,
      searchingText: '',
      subStartTime: this.props.startTime,
      subEndTime: this.props.endTime
    }    
    this.columns = [{
      title: '订单号',
      dataIndex: 'orderNo',
      width: '20%',
      className: 'firstCol'
    }, {
      title: '用户',
      dataIndex: 'username',
      width: '10%'
    }, {
      title: '使用设备',
      dataIndex: 'deviceType',
      width: '8%',
      render: (text,record,index) => (typeName[record.deviceType])
    }, {
      title: '所在学校',
      dataIndex: 'schoolName'
    }, {
      title: '开始时间',
      dataIndex: 'createTime',
      width: '11%',
      render: (text,record,index) => {
        return Time.getTimeStr(record.createTime)
      }
    }, {
      title: '结束时间',
      dataIndex: 'finishTime',
      width: '11%',
      render: (text,record,index) => {
        return Time.getTimeStr(record.finishTime)
      }
    }, {
      title: '使用状态',
      dataIndex: 'status',
      width: '12%',
      render: (text,record,index)=> {
        switch(record.status){
          case 1:
            return <Badge status='warning' text='使用中' />
          case 2:
            return <Badge status='success' text='使用结束' />
          case 4:
            return <Badge status='default' text='已退单' />
          default:
            return <Badge status='warning' text='使用结束' />
        }
      }
    }, {
      title: '消费金额',
      dataIndex: 'paymentType',
      width: '8%',
      className:'shalowRed',
      render: (text,record,index) => {
        if (record.status !== 1) {
          return `¥${record.consume}` || '暂无'
        } else if (record.prepay) {
          return `预付¥${record.prepay}`
        }
      }
    }, {
      title: (<p className='lastCol'>操作</p>),
      dataIndex: 'operation',
      width: '10%',
      render: (text, record, index) => (
        <div className='editable-row-operations lastCol'>
          <span>
            <Link to={`/order/orderInfo/:${record.id}`}  >详情</Link>
          </span>
        </div>
      )
    }]
  }
  fetchData = (body) => {
    this.setState({
      loading: true
    })
    let resource='/api/order/list'
    const cb = (json) => {
      let nextState = {loading: false}
      if(json.error){
        this.setState(nextState)
        throw new Error(json.error.displayMessage || json.error)
      }else{
        /*--------redirect --------*/
        if(json.data){
          json.data.orders&&json.data.orders.forEach((r,i)=>{
            r.paymentType = r.paymentType&&r.paymentType.toString()
          })
          nextState.dataSource = json.data.orders
          nextState.total = json.data.total
        }else{
          throw new Error('网络出错，请稍后重试～')
        }        
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource,body,cb)
  }  

  componentDidMount(){
    this.props.hide(false)
    let {state}=this.props.location
    let {page, schoolId, deviceType, status, selectKey, startTime, endTime} = this.props
    const body={
      page: page,
      size: SIZE
    }
    if (state) { // 如果是来自设备详情 或 用户详情，复位其它状态。
      body.page = 1
      this.props.changeOrder('order', {page: 1, schoolId: 'all', deviceType: 'all', status: 'all', selectKey: '', startTime: 0, endTime: 0})
      if(state.path === 'fromDevice'){
        body.residenceId = state.id
        body.deviceType = state.deviceType
      } else if (state.path === 'fromUser'){
        body.userId = state.id
      }
      this.fetchData(body)
      return
    }

    if (startTime) {
      body.startTime = startTime
      body.timeQueryType = 1 // 选择create_time
      body.endTime = endTime
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    if (deviceType !== 'all') {
      body.deviceType = parseInt(deviceType, 10)
    }
    if (status !== 'all') {
      body.status = parseInt(status, 10)
    }
    if (selectKey) {
      body.selectKey = selectKey
      this.setState({
        searchingText: selectKey
      })
    }
    this.fetchData(body)
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  componentWillReceiveProps (nextProps) {
    let {schoolId, deviceType, status, selectKey, page, startTime, endTime} = nextProps
    this.setState({
      subStartTime: startTime,
      subEndTime: endTime
    })
    const body={
      page: page,
      size: SIZE
    }
    if (startTime && endTime) {
      body.startTime = startTime
      body.endTime = endTime
      body.timeQueryType = 1
    }
    if (deviceType !== 'all') {
      body.deviceType = parseInt(deviceType, 10)
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    if (status !== 'all') {
      body.status = parseInt(status, 10)
    }
    if (selectKey) {
      body.selectKey = selectKey
    }
    let {state}=this.props.location
    if (state) {
      if (state.path === 'fromDevice') {
        body.residenceId = state.id
        body.deviceType = state.deviceType
      } else if (state.path === 'fromUser') {
        body.userId = state.id
      }
    }
    this.fetchData(body)
  }
  changeSchool = (value) => {
    /*-----value is the school id, used to fetch the school data-----*/
    /*-----does not reset other option other than searchText---------*/
    let {schoolId} = this.props
    if (value === schoolId) {
      return
    }
    this.props.changeOrder('order', {schoolId: value, page: 1})
  }
  changeDevice = (value) => {
    let {deviceType} = this.props
    if (value === deviceType) {
      return 
    }
    this.props.changeOrder('order', {deviceType: value, page: 1})
  }
  changeStatus = (value) => {
    let {status} = this.props
    if (value === status) {
      return 
    }
    this.props.changeOrder('order', {status: value, page: 1})   
  }
  changeSearch = (e) => {
    this.setState({
      searchingText: e.target.value
    })
  }
  pressEnter = () => {
    let {selectKey} = this.props
    let searchingText = this.state.searchingText.trim()
    if (selectKey !== searchingText) {
      this.props.changeOrder('order', {selectKey: searchingText, page: 1})
    }
  }
  back=()=>{
    this.props.history.goBack()
  }
  changePage = (pageObj) => {
    let page = pageObj.current
    this.props.changeOrder('order', {page: page})
  }
  changeStartTime = (v) => {
    let newStartTime = v ? parseInt(v.valueOf(), 10) : 0
    this.setState({
      subStartTime: newStartTime
    })
    if (newStartTime === 0) {
      return this.confirmStartTime({
        subStartTime: 0
      })
    }
  }
  changeEndTime = (v) => {
    let newEndTime = v ? parseInt(v.valueOf(), 10) : 0
    this.setState({
      subEndTime: newEndTime
    })
    if (newEndTime === 0) {
      return this.confirmEndTime({
        subEndTime: 0
      })
    }
  }
  confirmStartTime = (state) => {
    console.log('confirm')
    let {subStartTime} = {...this.state, ...state}
    let {startTime} = this.props
    if (startTime !== subStartTime) {
      this.props.changeOrder('order', {startTime: subStartTime, page: 1})
    }
  }
  confirmEndTime = (state) => {
    let {subEndTime} = {...this.state, ...state}
    let {endTime} = this.props
    if (endTime !== subEndTime) {
      this.props.changeOrder('order', {endTime: subEndTime, page: 1})
    }
  }
  startTimeOpenChange = (open) => {
    console.log(open)
  }
  render () {
    const {schoolId, deviceType, status, page, startTime, endTime} = this.props
    const {dataSource, total, loading, searchingText, subStartTime, subEndTime} = this.state
    const {state} = this.props.location

    return (
      <div className='contentArea'>
        <SearchLine
          showTimeChoose={true}
          timeChooseTitle='开始时间'
          startTime={subStartTime}
          endTime={subEndTime}
          changeStartTime={this.changeStartTime}
          changeEndTime={this.changeEndTime}
          confirmStartTime={this.confirmStartTime}
          confirmEndTime={this.confirmEndTime}
          startTimeOpenChange={this.startTimeOpenChange}
          endTimeOpenChange={this.endTimeOpenChange}

          searchInputText='宿舍／订单号' 
          searchingText={this.state.searchingText} 
          pressEnter={this.pressEnter} 
          changeSearch={this.changeSearch}
          selector1={<SchoolSelector selectedSchool={schoolId} changeSchool={this.changeSchool} />} 
          selector2={<DeviceSelector selectedDevice={deviceType} changeDevice={this.changeDevice} />} 
          selector3={<BasicSelector allTitle='所有使用状态' staticOpts={CONSTANTS.ORDERSTATUS} selectedOpt={status} changeOpt={this.changeStatus} />} 
        />

        <div className='tableList'>
          <Table 
            bordered 
            loading={loading}
            rowKey={(record)=>(record.id)} 
            pagination={{pageSize: SIZE, current: this.props.page, total: total}}  
            dataSource={dataSource} 
            columns={this.columns} 
            onChange={this.changePage}
          />
        </div>
        {state ?
          <div className='btnRight'>
            <Button onClick={this.back}>{BACKTITLE[state.path]}</Button>
          </div>:null
        }
      </div>
    )
  }
}

// export default OrderTable

const mapStateToProps = (state, ownProps) => {
  return {
    schoolId: state.changeOrder.order.schoolId,
    deviceType: state.changeOrder.order.deviceType,
    status: state.changeOrder.order.status,
    selectKey: state.changeOrder.order.selectKey,
    page: state.changeOrder.order.page,
    startTime: state.changeOrder.order.startTime,
    endTime: state.changeOrder.order.endTime
  }
}

export default withRouter(connect(mapStateToProps, {
  changeOrder
})(OrderTable))