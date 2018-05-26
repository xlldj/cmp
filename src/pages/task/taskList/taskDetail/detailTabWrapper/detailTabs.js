import React, { Component, Fragment } from 'react'
import { Button, Dropdown, Pagination, Menu, Modal, Carousel } from 'antd'
import UserInfo from './userInfo'
import UserOrderInfo from './userOrderInfo'
import UserRepairInfo from './userRepairInfo'
import DeviceInfo from './deviceInfo'
import DeviceOrderInfo from './deviceOrderInfo'
import DeviceRepairInfo from './deviceRepairInfo'
import CONSTANTS from '../../../../../constants'
const { TAB2HINT } = CONSTANTS

class DetailTabWrapper extends Component {
  render() {
    const { currentTab, data, selectedDetailId } = this.props
    const { creatorId, deviceType, deviceId, residenceId } = data

    return (
      <div className="taskDetail-panelWrapper">
        {currentTab === 1 ? (
          <UserInfo creatorId={creatorId} selectedDetailId={selectedDetailId} />
        ) : null}
        {currentTab === 2 ? (
          <UserOrderInfo
            creatorId={creatorId}
            selectedDetailId={selectedDetailId}
          />
        ) : null}
        {currentTab === 3 ? (
          <UserRepairInfo
            creatorId={creatorId}
            selectedDetailId={selectedDetailId}
          />
        ) : null}
        {currentTab === 4 ? (
          <DeviceInfo
            deviceType={deviceType}
            residenceId={residenceId}
            deviceId={deviceId}
            selectedDetailId={selectedDetailId}
          />
        ) : null}
        {currentTab === 5 ? (
          <DeviceOrderInfo
            deviceType={deviceType}
            residenceId={residenceId}
            deviceId={deviceId}
            selectedDetailId={selectedDetailId}
          />
        ) : null}
        {currentTab === 6 ? (
          <DeviceRepairInfo
            deviceType={deviceType}
            residenceId={residenceId}
            deviceId={deviceId}
            selectedDetailId={selectedDetailId}
          />
        ) : null}
      </div>
    )
  }
}

export default DetailTabWrapper
