import React from 'react'
import { Route, Switch} from 'react-router-dom'
import {asyncComponent} from '../../component/asyncComponent'

const ChargeTable = asyncComponent(() => import(/* webpackChunkName: "chargeTable" */ "./chargeTable"))
const ChargeInfo = asyncComponent(() => import(/* webpackChunkName: "chargeInfo" */ "./chargeInfo"))

class ChargeContainer extends React.Component {
  constructor (props) {
    super(props)
  }
  render () {
    return (
      <div>
        <Switch>
          <Route path='/fund/charge/editCharge/:id' render={(props)=>(<ChargeInfo hide={this.props.hide} {...props} />)} />
          <Route path='/fund/charge/addCharge' render={(props)=>(<ChargeInfo hide={this.props.hide} {...props} />)} />
          <Route exact path='/fund/charge' render={(props)=>(<ChargeTable hide={this.props.hide} {...props} />)} />
        </Switch>
      </div>
    )
  }
}

export default ChargeContainer
