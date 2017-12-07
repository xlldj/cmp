import React from 'react'
import { Link} from 'react-router-dom'

import {Table} from 'antd'
import AjaxHandler from '../../ajax'

import SearchLine from '../../component/searchLine'
import DeviceSelector from '../../component/deviceSelector'
import SchoolSelector from '../../component/schoolSelector'
import CONSTANTS from '../../component/constants'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeDevice } from '../../../actions'

const typeName =CONSTANTS.DEVICETYPE
const SIZE = CONSTANTS.PAGINATION

class DevicesTable extends React.Component {  
  static propTypes = {
    schoolId: PropTypes.string.isRequired,
    deviceType: PropTypes.string.isRequired,
    selectKey: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired
  }
  constructor(props){
    super(props)
    let dataSource=[],schools=[]
    let searchingText = '',searchText = '',reset = false, loading = false, total = 0
    this.state = {
      s: '',dataSource,schools, searchingText, searchText, reset, loading, total
    }
    this.columns = [{
      title: '学校',
      dataIndex: 'schoolId',
      className: 'firstCol',
      render: (text,record,index) => {
        if(this.state.schools.length){
          let sch = this.state.schools.find((r,i) => {return r.id === record.schoolId})
          return sch.name
        }else{
          return ''
        }
      }
    }, {
      title: '设备位置',
      dataIndex: 'location',
      width: '25%',
      render:(text,record)=>(text?text:'暂无')
    }, {
      title: '设备类型',
      dataIndex: 'type',
      width: '25%',
      render: (text,record,index) => (typeName[record.type])
    }, {
      title: (<p className='lastCol'>操作</p>),
      dataIndex: 'operation',
      width: '25%',
      render: (text, record, index) => {
        let addr = {pathname: `/device/list/deviceInfo/:${record.id}`, state: {id: record.id, deviceType: record.type, residenceId: record.residenceId}}
        return (
          <div className='editable-row-operations lastCol'>
            <span>
              <Link to={addr} >详情</Link>
            </span>
          </div>
        )
      }
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
    let resource='/api/device/query/list'
    const cb = (json) => {
      const nextState = {
        loading: false
      }
      if(json.error){
        this.setState(nextState)
        throw new Error(json.error.displayMessage || json.error)
      }else{
        /*--------redirect --------*/
        if(json.data){
          nextState.dataSource = json.data.devices
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
    let {page, schoolId, deviceType, selectKey} = this.props
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
    if(selectKey){
      body.selectKey = selectKey
    }
    this.fetchSchools()
    this.fetchData(body)
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  componentWillReceiveProps (nextProps) {
    let {page, schoolId, deviceType, selectKey} = nextProps
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
    if(selectKey){
      body.selectKey = selectKey
    }
    this.fetchData(body)
  }
  changeSchool = (value) => {
    let {schoolId} = this.props
    if (schoolId === value) {
      return
    }
    this.props.changeDevice('deviceList', {page: 1, schoolId: value})
  }
  changeDevice = (value) => {
    let {deviceType} = this.props
    if (deviceType === value) {
      return
    }
    this.props.changeDevice('deviceList', {page: 1, deviceType: value})
  }
  changeSearch = (e) => {
    this.setState({
      searchingText: e.target.value
    })
  }
  pressEnter = () => {
    let {selectKey} = this.props
    let {searchingText} = this.state
    if (selectKey === searchingText) {
      return
    }
    this.props.changeDevice('deviceList', {page: 1, selectKey: searchingText})
  }
  changePage = (pageObj) => {
    let page = pageObj.current
    this.props.changeDevice('deviceList', {page: page})
  }

  render () {
    const {dataSource, loading, total, searchingText} = this.state
    const {page, schoolId, deviceType} = this.props

    return (
      <div className='contentArea'>
        <SearchLine 
          searchInputText='设备位置' 
          selector1={<SchoolSelector selectedSchool={schoolId} changeSchool={this.changeSchool} />}
          selector2={<DeviceSelector selectedDevice={deviceType} changeDevice={this.changeDevice} />} 
          searchingText={searchingText} 
          pressEnter={this.pressEnter} 
          changeSearch={this.changeSearch} 
        />

        <div className='tableList'>
          <Table 
            loading={loading} 
            bordered 
            rowKey={(record)=>(record.id)} 
            pagination={{pageSize: SIZE, current: page, total: total}}  
            dataSource={dataSource} 
            columns={this.columns} 
            onChange={this.changePage}
          />
        </div>
      </div>
    )
  }
}

// export default DevicesTable

const mapStateToProps = (state, ownProps) => ({
  schoolId: state.changeDevice.deviceList.schoolId,
  deviceType: state.changeDevice.deviceList.deviceType,
  selectKey: state.changeDevice.deviceList.selectKey,
  page: state.changeDevice.deviceList.page
})

export default withRouter(connect(mapStateToProps, {
  changeDevice
})(DevicesTable))