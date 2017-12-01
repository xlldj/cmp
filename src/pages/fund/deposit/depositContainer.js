import React from 'react'
import {Switch, Route} from 'react-router-dom'
import {asyncComponent} from '../../component/asyncComponent'

const DepositTable= asyncComponent(()=>import(/* webpackChunkName: "depositTable" */ "./depositTable"))
const DepositInfo = asyncComponent(()=>import(/* webpackChunkName: "depositInfo" */ "./depositInfo"))

class DepositContainer extends React.Component {
  render () {
    return (
      <div>
        <Switch>
          <Route path='/fund/deposit/depositInfo/:id' render={(props) => (<DepositInfo hide={this.props.hide} {...props} />)} />
          <Route path='/fund/deposit/addDeposit' render={(props) => (<DepositInfo hide={this.props.hide} {...props} />)} />
          <Route exact path='/fund/deposit' render={(props) => (<DepositTable hide={this.props.hide} {...props} />)} />
        </Switch>
      </div>
    )
  }
}

export default DepositContainer
