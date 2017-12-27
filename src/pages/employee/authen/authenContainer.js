import React from 'react'
import { Route, Switch} from 'react-router-dom'
import {asyncComponent} from '../../component/asyncComponent'

const AuthenTable = asyncComponent(()=>import(/* webpackChunkName: "authenTable" */ "./authenTable"))
const AuthenInfo = asyncComponent(()=>import(/* webpackChunkName: "authenInfo" */ "./authenInfo"))

class AnthenContainer extends React.Component {
  render () {
    return (
      <div>
        <Switch>
          <Route path='/employee/authen/detail/:id' render={(props) => (<AuthenInfo hide={this.props.hide} {...props} />)} />
          <Route path='/employee/authen/add' render={(props) => (<AuthenInfo hide={this.props.hide} {...props} />)} />
          <Route exact path='/employee/authen' render={(props) => (<AuthenTable hide={this.props.hide} {...props} />)} />
        </Switch>
      </div>
    )
  }
}

export default AnthenContainer 
