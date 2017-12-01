import React from 'react'
import { Route, Switch} from 'react-router-dom'
import {asyncComponent} from '../../component/asyncComponent'
import '../style/style.css'

const CensorTable = asyncComponent(() => import(/* webpackChunkName: "censorTable" */ "./censorTable"))
const CensorInfo = asyncComponent(() => import(/* webpackChunkName: "censorInfo" */ "./censorInfo"))

class CensorContainer extends React.Component {
  render () {
    return (
      <div>
        <Switch>
          <Route path='/notify/censor/addCensor' render={(props) => (<CensorInfo hide={this.props.hide} {...props} />)} />
          <Route path='/notify/censor/info/:id' render={(props) => (<CensorInfo hide={this.props.hide} {...props} />)} />
          <Route exact path='/notify/censor' render={(props) => (<CensorTable hide={this.props.hide} {...props} />)} />
        </Switch>
      </div>
    )
  }
}


export default CensorContainer
