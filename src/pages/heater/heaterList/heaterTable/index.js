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
  dataSource: state.changeHeater.heaterList.dataSource,
  total: state.changeHeater.heaterList.total,
  loading: state.changeHeater.heaterList.loading,
  schoolId: state.changeHeater.heaterList.schoolId,
  heaterStatus: state.changeHeater.heaterList.heaterStatus,
  page: state.changeHeater.heaterList.page,
  schools: state.setSchoolList.schools
})

export default withRouter(
  connect(mapStateToProps, {
    changeHeater,
    fetchHeaterList
  })(tableHoc(HeaterTable, handleHeaterList))
)
