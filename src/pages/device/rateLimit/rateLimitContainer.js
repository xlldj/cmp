import React from 'react'
import { Route, Switch} from 'react-router-dom'
import {asyncComponent} from '../../component/asyncComponent'

const RateLimitTable = asyncComponent(() => import(/* webpackChunkName: "rateLimitTable" */ "./rateLimitTable"))
const RateLimitInfo = asyncComponent(() => import(/* webpackChunkName: "rateLimitInfo" */ "./rateLimitInfo"))

class RateLimitContainer extends React.Component {
  render () {
    return (
      <div>
        <Switch>
          <Route path='/device/rateLimit/editRateLimit/:id' render={(props)=>(<RateLimitInfo hide={this.props.hide} {...props} />)} />
          <Route path='/device/rateLimit/addRateLimit' render={(props)=>(<RateLimitInfo hide={this.props.hide} {...props} />)} />
          <Route exact path='/device/rateLimit' render={(props)=>(<RateLimitTable hide={this.props.hide} {...props} />)} />
        </Switch>
      </div>
    )
  }
}

export default RateLimitContainer 
