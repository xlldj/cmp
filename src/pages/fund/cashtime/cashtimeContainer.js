import React from 'react'
import { Route, Switch} from 'react-router-dom'
import {asyncComponent} from '../../component/asyncComponent'

const CashtimeTable = asyncComponent(() => import(/* webpackChunkName: "cashtimeTable" */ "./cashtimeTable"))
const CashtimeInfo = asyncComponent(() => import(/* webpackChunkName: "cashtimeInfo" */ "./cashtimeInfo"))

class CashtimeContainer extends React.Component {
  render () {
    return (
      <div>
        <Switch>
          <Route path='/fund/cashtime/addCashtime' render={(props)=>(<CashtimeInfo hide={this.props.hide} {...props} />)} />
          <Route path='/fund/cashtime/editCashtime/:id' render={(props)=>(<CashtimeInfo hide={this.props.hide} {...props} />)} />
          <Route exact path='/fund/cashtime' render={(props)=>(<CashtimeTable hide={this.props.hide} {...props} />)} />
        </Switch>
      </div>
    )
  }
}

export default CashtimeContainer
