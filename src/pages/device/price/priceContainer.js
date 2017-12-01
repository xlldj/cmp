import React from 'react'
import { Route, Switch} from 'react-router-dom'
import {asyncComponent} from '../../component/asyncComponent'

const PriceTable = asyncComponent(() => import(/* webpackChunkName: "priceTable" */ "./priceTable"))
const PriceInfo = asyncComponent(() => import(/* webpackChunkName: "priceInfo" */ "./priceInfo"))

class PriceContainer extends React.Component {
  constructor (props) {
    super(props)
  }
  render () {
    return (
      <div>
        <Switch>
          <Route path='/device/price/detail/:id' render={(props)=>(<PriceInfo hide={this.props.hide} {...props} />)} />
          <Route path='/device/price/addPrice' render={(props)=>(<PriceInfo hide={this.props.hide} {...props} />)} />
          <Route exact path='/device/price' render={(props)=>(<PriceTable hide={this.props.hide} {...props} />)} />
        </Switch>
      </div>
    )
  }
}

export default PriceContainer
