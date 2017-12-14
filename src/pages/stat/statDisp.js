import React from 'react'
import { Route } from 'react-router-dom'
import Bread from '../bread'
import './style/style.css'
import Stat from './stat'
import {getLocal} from '../util/storage'

const breadcrumbNameMap = {
}

class StatDisp extends React.Component {  
  setStatusFortask = () => {
    this.getDefaultSchool()
  }
  getDefaultSchool = () => {
    const recentSchools = getLocal('recentSchools'), defaultSchool = getLocal('defaultSchool')
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
      this.props.changeStat('overview', {schoolId: selectedSchool})
      this.props.changeStat('charts', {schoolId: selectedSchool})
      this.props.changeStat('rank', {schoolId: selectedSchool})
    }
  }
  render () {
    return (
      <div>
        <div className='breadc'>
          <Bread breadcrumbNameMap={breadcrumbNameMap} single parent='stat' parentName='统计分析'
            setStatusFortask={this.setStatusFortask}
          />
        </div>

        <div >
          <Route exact path='/stat' render={(props) => (<Stat hide={this.props.hide} {...props} />)} />
        </div>
      </div>
    )
  }
}

export default StatDisp
