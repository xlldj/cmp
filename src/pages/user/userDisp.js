import React from 'react'
import { Route } from 'react-router-dom'
import Bread from '../component/bread'
import './style/style.css'
import { getLocal } from '../../util/storage'
import UserTableView from './userTable'
import UserInfoView from './userInfo'
import UserFoxconn from './foxconn'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeUser, changeOrder, changeFund } from '../../actions'

const subModule = 'userList'

const mapStateToInfoProps = (state, ownProps) => ({
  forbiddenStatus: state.setAuthenData.forbiddenStatus
})

const UserInfo = withRouter(
  connect(mapStateToInfoProps, {
    changeOrder,
    changeFund
  })(UserInfoView)
)

const mapStateToTableProps = (state, ownProps) => ({
  schoolId: state.userModule[subModule].schoolId,
  selectKey: state.userModule[subModule].selectKey,
  page: state.userModule[subModule].page,
  userTransfer: state.userModule[subModule].userTransfer,
  forbiddenStatus: state.setAuthenData.forbiddenStatus
})

const UserTable = withRouter(
  connect(mapStateToTableProps, {
    changeUser
  })(UserTableView)
)

const breadcrumbNameMap = {
  '/userInfo': '详情',
  '/foxconn': '导入富士康员工'
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
            path="/user/foxconn"
            render={props => <UserFoxconn hide={this.props.hide} {...props} />}
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
