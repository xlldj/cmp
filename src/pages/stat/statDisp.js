import React from 'react'
import { Route } from 'react-router-dom'
import Bread from '../component/bread'
import './style/style.css'
import Stat from './stat'
import { getLocal } from '../../util/storage'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
const breadcrumbNameMap = {}

class StatDisp extends React.Component {
  setStatusFortask = () => {
    this.getDefaultSchool()
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
      // this.props.changeTask('taskList', {schoolId: selectedSchool})
      this.props.changeStat('overview', { schoolId: selectedSchool })
      this.props.changeStat('charts', { schoolId: selectedSchool })
      this.props.changeStat('rank', { schoolId: selectedSchool })
    }
  }
  render() {
    const { forbiddenStatus } = this.props
    const { STATISTICS_GET } = forbiddenStatus
    return (
      <div>
        <div className="breadc">
          <Bread
            breadcrumbNameMap={breadcrumbNameMap}
            single
            parent="stat"
            parentName="统计分析"
            setStatusFortask={this.setStatusFortask}
          />
        </div>

        <div>
          {STATISTICS_GET ? null : (
            <Route
              exact
              path="/stat"
              render={props => <Stat hide={this.props.hide} {...props} />}
            />
          )}
        </div>
      </div>
    )
  }
}
const mapStateToProps = (state, ownProps) => ({
  forbiddenStatus: state.setAuthenData.forbiddenStatus
})
export default withRouter(connect(mapStateToProps, null)(StatDisp))
