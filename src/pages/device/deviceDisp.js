import React from 'react'
import {Route, Redirect} from 'react-router-dom'
import {asyncComponent} from '../component/asyncComponent'
import './style/style.css'

import Bread from '../bread'
import {getLocal, setLocal} from '../util/storage'
import AjaxHandler from '../ajax'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeDevice } from '../../actions'

const DeviceContainer = asyncComponent(() => import(/* webpackChunkName: "deviceContainer" */ "./deviceList/deviceContainer"))
const ComponentContainer = asyncComponent(() => import(/* webpackChunkName: "componentContainer" */ "./components/componentContainer"))
const SupplierContainer = asyncComponent(() => import(/* webpackChunkName: "supplierList" */ "./supplier/supplierContainer"))
const RateSet = asyncComponent(() => import(/* webpackChunkName: "rateSet" */ "./rateSet/rateSet"))
const Repair = asyncComponent(() => import(/* webpackChunkName: "repair" */ "./repair/repair"))
const PrepayContainer = asyncComponent(() => import(/* webpackChunkName: "prepay" */ "./prepay/prepayContainer"))
const TimesetContainer = asyncComponent(() => import(/* webpackChunkName: "timeset" */ "./timeset/timesetContainer"))
const RateLimitContainer = asyncComponent(() => import(/* webpackChunkName: "rateLimit" */ "./rateLimit/rateLimitContainer"))

const breadcrumbNameMap = {
  '/list': '设备列表',
  '/list/deviceInfo': '设备详情',
  '/components': '设备配件',
  '/components/addComponent': '添加配件',
  '/components/editComponent': '编辑配件',
  '/components/componentType': '配件类型管理',
  '/prepay': '设备预付选项',
  '/prepay/addPrepay': '添加预付选项',
  '/prepay/editPrepay': '设备预付详情',
  '/timeset': '设备供水时段',
  '/timeset/addTimeset': '添加供水时段',
  '/timeset/editTimeset': '供水时段详情',
  '/suppliers': '供应商',
  '/suppliers/info': '详情',
  '/suppliers/addInfo': '添加供应商',
  '/rateSet': '费率设置',
  '/rateSet/rateInfo': '费率详情',
  '/rateSet/addRate': '添加费率',
  '/repair': '报修管理',
  '/repair/repairProblem': '常见问题设置',
  '/repair/repairRate': '评价列表',
  '/repair/repairInfo': '详情',
  '/repair/userRepairLog': '用户报修记录',
  '/price': '水量单价',
  '/price/list': '价格列表',
  '/price/addPrice': '添加单价',
  '/price/detail': '详情',
  '/rateLimit': '扣费速率',
  '/rateLimit/addRateLimit': '添加扣费速率',
  '/rateLimit/editRateLimit': '编辑扣费速率'
};

class DeviceDisp extends React.Component{
  changeSchool = (i) => {
    let deviceInfo={}
    this.setState({
      selectedSchoolId: i,
      deviceInfo
    })
  }
  changeEditingBlock = (i) => {
    this.setState({
      editingBlock: i
    })
  }
  setStatusFordevice = () => {
    this.clearStatus4deviceIIlist()
  }
  clearStatus4deviceIIlist = () => {
    this.getDefaultSchool()
    this.props.changeDevice('deviceList', {page: 1, deviceType: 'all', selectKey: ''})
  }
  clearStatus4deviceIIcomponents = () => {
    this.props.changeDevice('components', {page: 1})
  }
  clearStatus4deviceIIprepay = () => {
    this.props.changeDevice('prepay', {page: 1})
  }
  clearStatus4deviceIItimeset = () => {
    this.props.changeDevice('timeset', {page: 1})
  }
  clearStatus4deviceIIsuppliers = () => {
    this.props.changeDevice('suppliers', {page: 1})
  }
  clearStatus4deviceIIrateSet = () => {
    this.props.changeDevice('rateSet', {page: 1})
  }
  clearStatus4deviceIIrepair = () => {
    this.getDefaultSchool()
    this.props.changeDevice('repair', {page: 1, deviceType: 'all', status: 'all'})
  }
  clearStatus4deviceIIrateLimit = () => {
    this.props.changeDevice('rateLimit', {page: 1})
  }
  getDefaultSchool = () => {
    const recentSchools = getLocal('recentSchools')
    var selectedSchool = 'all'
    if (recentSchools) {
      let recent = recentSchools.split(',')
      let schoolId = recent[0]
      selectedSchool = schoolId
    } else if (getLocal('defaultSchool')) {
      let defaultSchool = getLocal('defaultSchool')
      selectedSchool = defaultSchool
    } else {
      this.setDefaultSchool()
    }
    if (selectedSchool !== 'all') {
      this.props.changeDevice('deviceList', {schoolId: selectedSchool})
      this.props.changeDevice('repair', {schoolId: selectedSchool})
    }
  }
  setDefaultSchool = () => {
    let resource = '/school/list'
    const body = {
      page: 1,
      size: 1
    }
    const cb = (json) => {
      if (json.data.schools) {
        let selectedSchool = json.data.schools[0].id.toString()
        setLocal('defaultSchool', selectedSchool)
        this.props.changeDevice('deviceList', {schoolId: selectedSchool})
        this.props.changeDevice('repair', {schoolId: selectedSchool})
      } 
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  render(){
    return(
      <div>
        <div className='breadc'>
          <Bread 
            breadcrumbNameMap={breadcrumbNameMap}
            parent='device'
            setStatusFordevice={this.setStatusFordevice}
            clearStatus4deviceIIlist={this.clearStatus4deviceIIlist}  
            clearStatus4deviceIIcomponents={this.clearStatus4deviceIIcomponents}  
            clearStatus4deviceIIprepay={this.clearStatus4deviceIIprepay} 
            clearStatus4deviceIItimeset={this.clearStatus4deviceIItimeset}  
            clearStatus4deviceIIsuppliers={this.clearStatus4deviceIIsuppliers}  
            clearStatus4deviceIIrateSet={this.clearStatus4deviceIIrateSet}   
            clearStatus4deviceIIrepair={this.clearStatus4deviceIIrepair} 
            clearStatus4deviceIIrateLimit={this.clearStatus4deviceIIrateLimit}
            parentName='设备管理' 
          />
        </div>

        <div className='disp'>
          <Route path="/device/list" render={(props) => (<DeviceContainer hide={this.props.hide} {...props} />)}  />
          <Route path="/device/suppliers" render={(props) => (<SupplierContainer hide={this.props.hide} {...props} />)}  />
          <Route path='/device/rateSet' render={(props) => (<RateSet hide={this.props.hide} {...props} />)} />
          <Route path='/device/repair' render={(props) => (<Repair hide={this.props.hide} {...props} />)} />
          <Route path='/device/components' render={(props) => (<ComponentContainer hide={this.props.hide} {...props} />)} />
          <Route path='/device/prepay' render={(props) => (<PrepayContainer hide={this.props.hide} {...props} />)} />
          <Route path='/device/timeset' render={(props) => (<TimesetContainer hide={this.props.hide} {...props} />)} />
          <Route path='/device/rateLimit' render={(props) => (<RateLimitContainer hide={this.props.hide} {...props} />)} />
          <Route exact path='/device' render={(props) => (<Redirect to='/device/list' />)}  />
        </div>
      </div>
    )
  }
} 

// export default DeviceDisp
export default withRouter(connect(null, {
  changeDevice
})(DeviceDisp))