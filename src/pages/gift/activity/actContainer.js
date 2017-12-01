import React from 'react'
import { Route, Switch} from 'react-router-dom'

import {asyncComponent} from '../../component/asyncComponent'

const ActTable = asyncComponent(()=>import(/* webpackChunkName: "actTable" */ "./actTable"))
const ActInfo = asyncComponent(()=>import(/* webpackChunkName: "actInfo" */ "./actInfo"))

class ActContainer extends React.Component {
  render () {
    return (
      <div>
	      <Switch>
	        <Route path='/gift/act/actInfo/:id' render={(props) => (<ActInfo hide={this.props.hide} {...props} />)} />
	        <Route path='/gift/act/addAct' render={(props) => (<ActInfo hide={this.props.hide} {...props} />)} />
	        <Route exact path='/gift/act' render={(props) => (<ActTable hide={this.props.hide} {...props} />)} />
        </Switch>
      </div>
    )
  }
}

export default ActContainer
