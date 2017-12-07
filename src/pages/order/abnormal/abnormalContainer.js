import React from 'react'
import { Route, Switch} from 'react-router-dom'
import {asyncComponent} from '../../component/asyncComponent'

const AbnormalTable = asyncComponent(() => import(/* webpackChunkName: "abnormalTable" */ "./abnormalTable"))
const AbnormalInfo = asyncComponent(() => import(/* webpackChunkName: "abnormalInfo" */ "./abnormalInfo"))

class AbnormalContainer extends React.Component {
  render () {
    return (
      <div>
        <Switch>
          <Route path='/order/abnormal/detail/:id' render={(props)=>(<AbnormalInfo hide={this.props.hide} {...props} />)} />
          <Route exact path='/order/abnormal' render={(props)=>(<AbnormalTable hide={this.props.hide} {...props} />)} />
        </Switch>
      </div>
    )
  }
}

export default AbnormalContainer 
