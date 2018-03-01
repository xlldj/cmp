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
  dataSource: state.changeDevice.deviceList.dataSource,
  total: state.changeDevice.deviceList.total,
  loading: state.changeDevice.deviceList.loading,
  schoolId: state.changeDevice.deviceList.schoolId,
  deviceType: state.changeDevice.deviceList.deviceType,
  selectKey: state.changeDevice.deviceList.selectKey,
  page: state.changeDevice.deviceList.page,
  schools: state.setSchoolList.schools
})

export default withRouter(
  connect(mapStateToProps, {
    changeDevice,
    fetchDeviceList
  })(tableHoc(DeviceTable, handleDeviceList))
)
