import React from 'react'
import { Route, Switch} from 'react-router-dom'
import {asyncComponent} from '../../component/asyncComponent'

const SupplierTable = asyncComponent(() => import(/* webpackChunkName: "supplierTable" */ "./supplierTable"))
const SupplierInfo = asyncComponent(() => import(/* webpackChunkName: "supplierInfo" */ "./supplierInfo"))

class SupplierContainer extends React.Component {
  constructor (props) {
    super(props)
  }
  render () {
    return (
      <div>
        <Switch>
          <Route path='/device/suppliers/info/:id' render={(props)=>(<SupplierInfo hide={this.props.hide} {...props} />)} />
          <Route path='/device/suppliers/addInfo' render={(props)=>(<SupplierInfo hide={this.props.hide} {...props} />)} />
          <Route exact path='/device/suppliers' render={(props)=>(<SupplierTable hide={this.props.hide} {...props} />)} />
        </Switch>
      </div>
    )
  }
}

export default SupplierContainer
