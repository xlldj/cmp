import React from 'react'
import {  Route, Switch} from 'react-router-dom'
import {asyncComponent} from '../../component/asyncComponent'

const RateInfo = asyncComponent(() => import(/* webpackChunkName: "rateInfo" */ "./rateInfo"))
const RateList = asyncComponent(() => import(/* webpackChunkName: "rateList" */ "./rateList"))

class RateSet extends React.Component{
  render(){
    return(
      <div>
        <Switch>
          <Route path='/device/rateSet/rateInfo/:id' render={(props) => (<RateInfo hide={this.props.hide} {...props} />)} />
          <Route path='/device/rateSet/addRate' render={(props) => (<RateInfo hide={this.props.hide} {...props} />)} />
          <Route exact path='/device/rateSet' render={(props) => (<RateList hide={this.props.hide} {...props} />)} />
        </Switch>
      </div>
    )
  }
}

export default RateSet

