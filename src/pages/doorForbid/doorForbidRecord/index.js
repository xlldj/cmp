import React from 'react'

import { Route, Switch } from 'react-router-dom'
import BackDormTable from './backDormTable'
import BackDormSettingInfo from './backDormSetting'

class DoorForbidRecordContainer extends React.Component {
  render() {
    return (
      <div>
        <Switch>
          {/* <Route
            path="/doorForbid/list/detail/:id"
            render={props => <HeaterDetail hide={this.props.hide} {...props} />}
          /> */}
          <Route
            path="/doorForbid/record/setting"
            render={props => <BackDormSettingInfo {...props} {...this.props} />}
          />
          <Route
            exact
            path="/doorForbid/record"
            render={props => <BackDormTable {...props} {...this.props} />}
          />
        </Switch>
      </div>
    )
  }
}

export default DoorForbidRecordContainer
