import tableHoc from '../../../../public/tableHoc'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeHeater, fetchHeaterList } from '../../../../actions'

import { checkObject } from '../../../../util/checkSame'
import HeaterTable from './ui'

const handleHeaterList = (newProps, oldProps, thisObj) => {
  if (checkObject(newProps, oldProps, ['page', 'schoolId', 'heaterStatus'])) {
    return
  }
  newProps.fetchHeaterList(newProps)
}
const mapStateToProps = (state, ownProps) => ({
  dataSource: state.heaterModule.heaterList.dataSource,
  total: state.heaterModule.heaterList.total,
  loading: state.heaterModule.heaterList.loading,
  schoolId: state.heaterModule.heaterList.schoolId,
  heaterStatus: state.heaterModule.heaterList.heaterStatus,
  page: state.heaterModule.heaterList.page,
  schools: state.setSchoolList.schools
})

export default withRouter(
  connect(mapStateToProps, {
    changeHeater,
    fetchHeaterList
  })(tableHoc(HeaterTable, handleHeaterList))
)
