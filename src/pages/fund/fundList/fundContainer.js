import React from 'react'
import { Route, Switch} from 'react-router-dom'
import {asyncComponent} from '../../component/asyncComponent'

const FundTable= asyncComponent(()=>import(/* webpackChunkName: "fundTable" */ "./fundTable"))
const FundInfo = asyncComponent(()=>import(/* webpackChunkName: "fundInfo" */ "./fundInfo"))

class DeviceContainer extends React.Component {
  render () {
    return (
      <div>
        <Switch>
          <Route path='/fund/list/fundInfo/:id' render={(props) => (<FundInfo hide={this.props.hide} {...props} />)} />
          <Route exact path='/fund/list' render={(props) => (<FundTable hide={this.props.hide} {...props} />)} />
          <Route exact path='/fund' render={(props) => (<FundTable hide={this.props.hide} {...props} />)} />
        </Switch>
      </div>
    )
  }
}

export default DeviceContainer
