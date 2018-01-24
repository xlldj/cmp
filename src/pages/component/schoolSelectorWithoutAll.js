import React from 'react'
import AjaxHandler from '../../util/ajax'
import { getLocal, setLocal } from '../../util/storage'
import CONSTANTS from './constants'
import Select from './select'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { setSchoolList } from '../../actions'

const { Option, OptGroup } = Select

class SchoolSelector extends React.Component {
  static propTypes = {
    recent: PropTypes.array.isRequired,
    schools: PropTypes.array.isRequired,
    schoolSet: PropTypes.bool.isRequired
  }
  componentDidMount() {
    // this.fetchSchools()
    let { schoolSet } = this.props
    if (!schoolSet) {
      this.fetchSchools()
    }
  }
  fetchSchools = () => {
    let resource = '/school/list'
    const body = {
      page: 1,
      size: 100
    }
    const cb = json => {
      if (json.data) {
        let recentSchools = getLocal('recentSchools'),
          recent = []

        if (recentSchools) {
          let localRecentArray = recentSchools.split(',')
          localRecentArray.forEach(r => {
            let index = json.data.schools.findIndex(
              s => s.id === parseInt(r, 10)
            )
            if (index !== -1) {
              recent.push(json.data.schools[index])
            }
          })
        }
        this.props.setSchoolList({
          schoolSet: true,
          recent: recent,
          schools: json.data.schools
        })
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  setRecentSchools = () => {
    try {
      let { recent } = this.props
      let recentItems =
        recent &&
        recent.map((r, i) => {
          return (
            <Option value={r.id.toString()} key={`recent-${r.id}`}>
              {r && r.name ? r.name : ''}
            </Option>
          )
        })
      return <OptGroup title="最近的选择">{recentItems}</OptGroup>
    } catch (e) {
      console.log(e)
    }
  }
  changeSchool = v => {
    /* if v is not 'all', store it in the lcoal */
    let name = ''
    if (v !== 'all') {
      let { schools, recent } = this.props
      let school = schools.find(r => r.id === parseInt(v, 10)) // school是肯定存在的
      try {
        name = school.name
        let i = -1
        if (recent.length > 0) {
          i = recent.findIndex(r => r.id === parseInt(v, 10))
        }
        if (i !== -1) {
          // 如果已经存在于recent中，将其位置提到最上
          recent.splice(i, 1)
          recent.unshift(school)
        } else if (recent.length >= CONSTANTS.RECENTCOUNT) {
          // 如果已满，删除最后一个
          recent.pop()
          recent.unshift(school)
        } else {
          // 直接添加进recent中
          recent.unshift(school)
        }

        let recentStr = recent.map(r => r.id).join(',')
        setLocal('recentSchools', recentStr)
        this.props.setSchoolList({ recent: recent })
      } catch (e) {
        console.log(e)
      }
    }
    this.props.changeSchool(v, name)
  }
  checkSchool = v => {
    if (this.props.checkSchool) {
      this.props.checkSchool(v)
    }
  }
  render() {
    const { schools } = this.props

    const schNameOptions = schools.map((s, i) => (
      <Option value={s.id.toString()} key={s.id}>
        {s.name}
      </Option>
    ))

    return (
      <Select
        disabled={this.props.disabled ? this.props.disabled : false}
        width={this.props.width ? this.props.width : ''}
        notFoundTitle="选择学校"
        search
        value={
          this.props.selectedSchool ? this.props.selectedSchool.toString() : ''
        }
        className={this.props.className ? this.props.className : 'customSelect'}
        onChange={this.changeSchool}
        onBlur={this.checkSchool}
      >
        {schNameOptions}
      </Select>
    )
  }
}

// export default SchoolSelector

const mapStateToProps = (state, ownProps) => {
  return {
    schools: state.setSchoolList.schools,
    schoolSet: state.setSchoolList.schoolSet,
    recent: state.setSchoolList.recent
  }
}

export default withRouter(
  connect(mapStateToProps, {
    setSchoolList
  })(SchoolSelector)
)
