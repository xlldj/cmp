import tableHoc from '../../../../public/tableHoc'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeHeater, fetchHeaterList } from '../../../../actions'
import CONSTANTS from '../../../../constants'

import { checkObject } from '../../../../util/checkSame'
import HeaterTable from './ui'

const { PAGINATION: SIZE, HEATER_LIST_TAB_REGISTERD } = CONSTANTS
const subModule = 'heaterList'

const handleHeaterList = (newProps, oldProps, thisObj) => {
  if (checkObject(newProps, oldProps, ['page', 'schoolId', 'tabIndex'])) {
    return
  }
  let { schoolId, page, tabIndex } = newProps
  const body = {
    page: page || 1,
    size: SIZE,
    status: tabIndex // state of tabIndex === state of status
  }
  if (tabIndex === HEATER_LIST_TAB_REGISTERD && schoolId !== 'all') {
    body.schoolId = parseInt(schoolId, 10)
  }
  newProps.fetchHeaterList(body, subModule)
}
const mapStateToProps = (state, ownProps) => ({
  dataSource: state.heaterModule.heaterList.dataSource,
  total: state.heaterModule.heaterList.total,
  loading: state.heaterModule.heaterList.loading,
  schoolId: state.heaterModule.heaterList.schoolId,
  tabIndex: state.heaterModule.heaterList.tabIndex,
  page: state.heaterModule.heaterList.page,
  schools: state.setSchoolList.schools
})

export default withRouter(
  connect(mapStateToProps, {
    changeHeater,
    fetchHeaterList
  })(tableHoc(HeaterTable, handleHeaterList))
)
