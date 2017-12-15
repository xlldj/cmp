import React from 'react'
import { Route, Switch} from 'react-router-dom'
import {asyncComponent} from '../component/asyncComponent'

const GiftTable = asyncComponent(()=>import(/* webpackChunkName: "giftTable" */ "./giftTable"))
const GiftInfo = asyncComponent(()=>import(/* webpackChunkName: "giftInfo" */ "./giftInfo"))

class GiftContainer extends React.Component {
  render () {
    return (
      <div>
        <Switch>
          <Route path='/gift/list/giftInfo/:id' render={(props) => (<GiftInfo hide={this.props.hide} {...props} />)} />
          <Route path='/gift/list/addGift' render={(props) => (<GiftInfo hide={this.props.hide} {...props} />)} />
          <Route path='/gift/list' render={(props) => (<GiftTable hide={this.props.hide} {...props} />)} />
        </Switch>
      </div>
    )
  }
}

export default GiftContainer
