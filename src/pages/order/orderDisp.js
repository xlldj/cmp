import React from 'react'
import { Route } from 'react-router-dom'
import {asyncComponent} from '../component/asyncComponent'
//import OrderInfo from './orderInfo'
//import OrderTable from './orderTable'
import Bread from '../bread'
import {getLocal, setLocal} from '../util/storage'
import AjaxHandler from '../ajax'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeOrder } from '../../actions'

const OrderTable = asyncComponent(() => import(/* webpackChunkName: "orderTable" */ "./orderTable"))
const OrderInfo = asyncComponent(() => import(/* webpackChunkName: "orderInfo" */ "./orderInfo"))

const breadcrumbNameMap = {
  '/orderInfo': '订单详情'
}

class OrderDisp extends React.Component {
  setStatusFororder = () => {
    this.getDefaultSchool()
    this.props.changeOrder('order', {page: 1, deviceType: 'all', status: 'all', selectKey: ''})
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
      this.props.changeOrder('order', {schoolId: selectedSchool})
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
        let id = json.data.schools[0].id.toString()
        setLocal('defaultSchool', id)
        this.props.changeOrder('order', {schoolId: id})
      } 
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  render () {
    return (
      <div>
        <div className='breadc'>
          <Bread breadcrumbNameMap={breadcrumbNameMap} parent='order' setStatusFororder={this.setStatusFororder}  single={true} parentName='订单管理' />
        </div>

        <div className='disp'>
          <Route exact path='/order' render={(props) => (<OrderTable hide={this.props.hide} {...props} />)} />
          <Route path='/order/orderInfo/:id' render={(props) => (<OrderInfo hide={this.props.hide} {...props} />)} />
        </div>
      </div>
    )
  }
}

// export default OrderDisp

export default withRouter(connect(null, {
  changeOrder
})(OrderDisp))