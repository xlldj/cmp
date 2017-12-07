import React from 'react'
import { Route, Switch} from 'react-router-dom'
import {asyncComponent} from '../../component/asyncComponent'

const PrepayTable = asyncComponent(() => import(/* webpackChunkName: "prepayTable" */ "./prepayTable"))
const PrepayInfo = asyncComponent(() => import(/* webpackChunkName: "prepayInfo" */ "./prepayInfo"))

class PrepayContainer extends React.Component {
  render () {
    return (
      <div>
        <Switch>
          <Route path='/device/prepay/editPrepay/:id' render={(props)=>(<PrepayInfo hide={this.props.hide} {...props} />)} />
          <Route path='/device/prepay/addPrepay' render={(props)=>(<PrepayInfo hide={this.props.hide} {...props} />)} />
          <Route exact path='/device/prepay' render={(props)=>(<PrepayTable hide={this.props.hide} {...props} />)} />
        </Switch>
      </div>
    )
  }
}

export default PrepayContainer
