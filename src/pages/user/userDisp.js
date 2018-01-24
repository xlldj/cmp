import React from 'react'
import { Route } from 'react-router-dom'
import Bread from '../component/bread'
import { asyncComponent } from '../component/asyncComponent'
import './style/style.css'
import { getLocal } from '../util/storage'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeUser } from '../../actions'

const UserTable = asyncComponent(() =>
  import(/* webpackChunkName: "userTable" */ './userTable')
)
const UserInfo = asyncComponent(() =>
  import(/* webpackChunkName: "userInfo" */ './userInfo')
)

const breadcrumbNameMap = {
  '/userInfo': '详情'
}

class UserDisp extends React.Component {
  setStatusForuser = () => {
    this.getDefaultSchool()
    this.props.changeUser('userList', { page: 1, selectKey: '' })
  }
  getDefaultSchool = () => {
    const recentSchools = getLocal('recentSchools'),
      defaultSchool = getLocal('defaultSchool')
    var selectedSchool = 'all'
    if (recentSchools) {
      let recent = recentSchools.split(',')
      let schoolId = recent[0]
      selectedSchool = schoolId
    } else if (defaultSchool) {
      selectedSchool = defaultSchool
    }
    if (selectedSchool !== 'all') {
      this.props.changeUser('userList', { schoolId: selectedSchool })
    }
  }

  render() {
    return (
      <div>
        <div className="breadc">
          <Bread
            breadcrumbNameMap={breadcrumbNameMap}
            single={true}
            parent="user"
            setStatusForuser={this.setStatusForuser}
            parentName="用户管理"
          />
        </div>

        <div className="disp">
          <Route
            path="/user/userInfo/:id"
            render={props => <UserInfo hide={this.props.hide} {...props} />}
          />
          <Route
            exact
            path="/user"
            render={props => <UserTable hide={this.props.hide} {...props} />}
          />
        </div>
      </div>
    )
  }
}

export default withRouter(
  connect(null, {
    changeUser
  })(UserDisp)
)
