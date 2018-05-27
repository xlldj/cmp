import React, { Component } from 'react'
import UserInfo from './userInfo'
import UserOrderInfo from './userOrderInfo'
import UserRepairInfo from './userRepairInfo'
import DeviceInfo from './deviceInfo'
import DeviceOrderInfo from './deviceOrderInfo'
import DeviceRepairInfo from './deviceRepairInfo'
import UserFundInfo from './userFundInfo'
import UserComplaintInfo from './userComplaintInfo'
import UserFeedBackInfo from './userFeedBackInfo'

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
        {currentTab === 7 ? (
          <UserFundInfo
            creatorId={creatorId}
            selectedDetailId={selectedDetailId}
          />
        ) : null}
        {currentTab === 8 ? (
          <UserComplaintInfo
            creatorId={creatorId}
            selectedDetailId={selectedDetailId}
          />
        ) : null}
        {currentTab === 9 ? (
          <UserFeedBackInfo
            creatorId={creatorId}
            selectedDetailId={selectedDetailId}
          />
        ) : null}
        {currentTab === 10 ? (
          <UserFeedBackInfo
            creatorId={creatorId}
            selectedDetailId={selectedDetailId}
          />
        ) : null}
      </div>
    )
  }
}

export default DetailTabWrapper
