import React from 'react'
import { Link} from 'react-router-dom'

import {Table, Select, Badge, Button} from 'antd'

import AjaxHandler from '../../ajax'
import SearchLine from '../../component/searchLine'
import SchoolSelector from '../../component/schoolSelector'
import BasicSelector from '../../component/basicSelector'
import DeviceSelector from '../../component/deviceSelector'
import Time from '../../component/time'
import CONSTANTS from '../../component/constants'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeDevice } from '../../../actions'
const subModule = 'repair'

const SIZE = CONSTANTS.PAGINATION

const Option = Select.Option
const typeName = CONSTANTS.DEVICETYPE

const STATUS = CONSTANTS.REPAIRSTATUS
const STATUSFORSHOW = CONSTANTS.REPAIRSTATUSFORSHOW


class RepairList extends React.Component {
  static propTypes = {
    schoolId: PropTypes.string.isRequired,
    deviceType: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired
  }
  constructor(props){
    super(props)
    let dataSource=[],schools=[], total=0, loading=false
    this.state = {
      dataSource,schools, total, loading
    }

    this.columns = [{
      title: (<p className='firstCol'>学校名称</p>),
      dataIndex: 'schoolName',
      width: '19%'
    }, {
      title: '设备类型',
      dataIndex: 'deviceType',
      width: '9%',
      render: (text,record,index) => (typeName[record.deviceType])
    }, {
      title: '设备位置',
      dataIndex: 'location',
      width: '15%'
    }, {
      title: '用户申请时间和已等待时间',
      dataIndex: 'hardwareNo',
      width: '24%',
      render: (text,record,index) => {
        let applyTS = Time.getTimeStr(record.createTime)
        let stopT = record.status=== '7' ? new Date(record.finishTime) : (record.status === '5' ? new Date(record.censorTime) : undefined )
        
        let waitTime = stopT ? Time.getTimeInterval(record.createTime, stopT.getTime()):Time.getSpan(record.createTime)
        let waitTimeStr = stopT ? `总用时${waitTime}` : `已等待${waitTime}`
        return applyTS+' ('+waitTimeStr+')'
      }
    }, {
      title: '维修状态',
      dataIndex: 'status',
      width: '12%',
      render: (text,record,index) => {
        switch(record.status){
          case '7':
            return <Badge status='success' text='维修完成' />
            break;
          case '3':
            return <Badge status='warning' text={STATUS[record.status]+`(${record.assignName})`} />
            break;
          case '4':
            return <Badge status='warning' text={STATUS[record.status]} />
            break;
          case '1':
          case '2':
          case '5':
            return <Badge status='error' text={STATUS[record.status]} />
            break;
          case '6':
            return <Badge status='error' text={STATUSFORSHOW[record.status]+`(${record.assignName})`} />
            break;
          default:
            return '已取消'
            break
        }
      }
    }, {
      title: (<p className='lastCol'>操作</p>),
      dataIndex: 'operation',
      width: '7%',
      render: (text, record, index) => (
        <div className='editable-row-operations lastCol'>
          <span>
            <Link to={`/device/repair/repairInfo/:${record.id}`} >详情</Link>
          </span>
        </div>
      )
    }]
  }

  fetchSchools = () => {
    let resource='/api/school/list'
    const body={
      page: 1,
      size: 100
    }
    const cb = (json) => {
        if(json.error){
          throw new Error(json.error.displayMessage || json.error)
        }else{
          /*--------redirect --------*/
          if(json.data){
            this.setState({
              schools: json.data.schools
            })
          }else{
            throw new Error('网络出错，请稍后重试～')
          }        
        }
    }
    AjaxHandler.ajax(resource,body,cb)
  }  

  fetchData = (body) => {
    this.setState({
      loading: true
    })
    /*------------change the resource api here-------------*/
    let resource='/api/repair/list'
    const cb = (json) => {
      let nextState = {loading: false}
      if(json.error){
        throw new Error(json.error.displayMessage || json.error)
      }else{
        /*--------redirect --------*/
        if(json.data){
          json.data.repairDevices&&json.data.repairDevices.map((r,i)=>{
            r.status = r.status.toString()
          })
          nextState.dataSource = json.data.repairDevices
          nextState.total = json.data.total
          if (body.page === 1) {
            nextState.page = 1
          }
        }else{
          this.setState(nextState)
          throw new Error('网络出错，请稍后重试～')
        }        
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource,body,cb, this.errorHandler)
  }  
  errorHandler = () => {
    this.setState({
      loading: false
    })
  }

  componentDidMount(){
    this.props.hide(false)
    let {page, schoolId, deviceType, status} = this.props
    const body = {
      page: page,
      size: SIZE
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    if(deviceType !== 'all'){
      body.type = deviceType
    }
    if(status !== 'all'){
      let statusArray = []
      statusArray.push(parseInt(status, 10))
      body.status = statusArray
    }
    this.fetchSchools()
    this.fetchData(body)
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  componentWillReceiveProps (nextProps) {
    let {page, schoolId, deviceType, status} = nextProps
    const body = {
      page: page,
      size: SIZE
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    if(deviceType !== 'all'){
      body.type = deviceType
    }
    if(status !== 'all'){
      let statusArray = []
      statusArray.push(parseInt(status, 10))
      body.status = statusArray
    }
    this.fetchData(body)
  }
  changeSchool = (value) => {
    let {schoolId} = this.props
    if (schoolId === value) {
      return
    }
    this.props.changeDevice(subModule, {page: 1, schoolId: value})
  }
  changeDevice = (value) => {
    let {deviceType} = this.props
    if (deviceType === value) {
      return
    }
    this.props.changeDevice(subModule, {page: 1, deviceType: value})
  }
  changeStatus = (value) => {
    let {status} = this.props
    if (status === value) {
      return
    }
    this.props.changeDevice(subModule, {page: 1, status: value})    
  }
  changePage = (pageObj) => {
    let page = pageObj.current
    this.props.changeDevice(subModule, {page: page})
  }
  render () {
    const {schools,dataSource, loading, total} = this.state
    const {schoolId, deviceType, status, page} = this.props

    return (
      <div className='contentArea'>
        <div className='navLink'>
          <Link to='/device/repair/repairProblem'><Button type='primary'>常见问题设置</Button></Link>
          <Link to='/device/repair/repairRate'><Button type='primary'>评价列表</Button></Link>
        </div>
        <SearchLine 
          selector1={<SchoolSelector selectedSchool={schoolId} changeSchool={this.changeSchool} />} 
          selector2={<DeviceSelector selectedDevice={deviceType} changeDevice={this.changeDevice} />} 
          selector3={<BasicSelector allTitle='全部状态' staticOpts={STATUS} selectedOpt={status} changeOpt={this.changeStatus} />}
        />
        <div className='tableList repairList'>
          <Table 
            bordered
            loading={loading}
            rowKey={(record)=> (record.id)} 
            pagination={{pageSize: SIZE, total: total, current: page}} 
            onChange={this.changePage}  
            dataSource={dataSource} 
            columns={this.columns}
          />
        </div>
      </div>
    )
  }
}


const mapStateToProps = (state, ownProps) => ({
  schoolId: state.changeDevice[subModule].schoolId,
  deviceType: state.changeDevice[subModule].deviceType,
  status: state.changeDevice[subModule].status,
  page: state.changeDevice[subModule].page
})

export default withRouter(connect(mapStateToProps, {
  changeDevice
})(RepairList))
