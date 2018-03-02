import tableHoc from '../../../../public/tableHoc'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeDevice, fetchDeviceList } from '../../../../actions'

import { checkObject } from '../../../../util/checkSame'
import DeviceTable from './ui'

const handleDeviceList = (newProps, oldProps, thisObj) => {
  if (
    checkObject(newProps, oldProps, [
      'page',
      'schoolId',
      'deviceType',
      'selectKey'
    ])
  ) {
    return
  }
  newProps.fetchDeviceList(newProps)
}
const mapStateToProps = (state, ownProps) => ({
  dataSource: state.deviceModule.deviceList.dataSource,
  total: state.deviceModule.deviceList.total,
  loading: state.deviceModule.deviceList.loading,
  schoolId: state.deviceModule.deviceList.schoolId,
  deviceType: state.deviceModule.deviceList.deviceType,
  selectKey: state.deviceModule.deviceList.selectKey,
  page: state.deviceModule.deviceList.page,
  schools: state.setSchoolList.schools
})

export default withRouter(
  connect(mapStateToProps, {
    changeDevice,
    fetchDeviceList
  })(tableHoc(DeviceTable, handleDeviceList))
)
