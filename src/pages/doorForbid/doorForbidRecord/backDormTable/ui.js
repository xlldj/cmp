import React from 'react'

import { Button } from 'antd'

import PhaseLine from '../../../component/phaseLine'
import SchoolSelector from '../../../component/schoolSelectorWithoutAll'
import BasicSelector from '../../../component/basicSelector'
import CONSTANTS from '../../../../constants/doorForbid'

import BackDormTimeTable from './timeSetting'
import BackDormReportTable from './report'
import BackDormRecordTable from './record'
import BackDormRecordDetail from './record/detail'
import { fetchBuildings } from '../../action'
// import DOORFORBID from '../../../../constants/doorForbid'

const {
  DOORFORBID_PAGE_TAB_RECORD,
  DOORFORBID_PAGE_TAB_REPORT,
  DOORFORBID_PAGE_TAB_TIME,
  DOORFORBID_RECORD_TAB,
  DOORFORBID_REPORT_TAB,
  DOORFORBID_TIMESETTING_TAB
} = CONSTANTS
const subModule = 'backDormRecord'

class BackDormTable extends React.Component {
  componentDidMount() {
    const { schoolId } = this.props
    this.resetTabIndexIfNeeded()
    fetchBuildings(schoolId, this.props, subModule)
  }
  state = {
    refreshNeed: false
  }
  changeSchool = value => {
    let { schoolId, tabIndex } = this.props
    if (schoolId === value) {
      return
    }

    if (tabIndex === DOORFORBID_PAGE_TAB_RECORD) {
      this.props.changeDoorForbid(subModule, {
        record_page: 1,
        schoolId: value,
        buildingId: 'all'
      })
    } else if (tabIndex === DOORFORBID_PAGE_TAB_REPORT) {
      this.props.changeDoorForbid(subModule, {
        report_page: 1,
        schoolId: value,
        buildingId: 'all'
      })
    } else if (tabIndex === DOORFORBID_PAGE_TAB_TIME) {
      this.props.changeDoorForbid(subModule, {
        timeSetting_page: 1,
        schoolId: value,
        buildingId: 'all'
      })
    }
    fetchBuildings(value, this.props, subModule)
  }

  changeTab = v => {
    let { tabIndex } = this.props
    if (tabIndex === v) {
      return
    }
    this.props.changeDoorForbid(subModule, {
      tabIndex: v
    })
  }

  changeBuilding = v => {
    let { buildingId, tabIndex } = this.props
    if (buildingId === v) {
      return
    }
    if (tabIndex === DOORFORBID_PAGE_TAB_RECORD) {
      this.props.changeDoorForbid(subModule, {
        record_page: 1,
        buildingId: v
      })
    } else if (tabIndex === DOORFORBID_PAGE_TAB_REPORT) {
      this.props.changeDoorForbid(subModule, {
        report_page: 1,
        buildingId: v
      })
    } else if (tabIndex === DOORFORBID_PAGE_TAB_TIME) {
      this.props.changeDoorForbid(subModule, {
        timeSetting_page: 1,
        buildingId: v
      })
    }
  }

  settingBackDormTime = v => {
    this.props.history.push({ pathname: '/doorForbid/record/setting' })
  }
  getTabs = () => {
    const { forbiddenStatus } = this.props
    let tabs = []
    const {
      BACK_TIME_LIST_GET,
      BACK_RECORD_GET,
      BACK_REPORT_GET
    } = forbiddenStatus
    if (!BACK_RECORD_GET) {
      tabs.push(DOORFORBID_RECORD_TAB)
    }
    if (!BACK_REPORT_GET) {
      tabs.push(DOORFORBID_REPORT_TAB)
    }
    if (!BACK_TIME_LIST_GET) {
      tabs.push(DOORFORBID_TIMESETTING_TAB)
    }
    return tabs
  }
  resetTabIndexIfNeeded = () => {
    const { forbiddenStatus } = this.props
    const {
      BACK_TIME_LIST_GET,
      BACK_RECORD_GET,
      BACK_REPORT_GET
    } = forbiddenStatus
    const hasRight2SeeOrderList = !(
      BACK_TIME_LIST_GET &&
      BACK_RECORD_GET &&
      BACK_REPORT_GET
    )
    if (hasRight2SeeOrderList) {
      // 有查看订单列表的权限，无需进一步操作
      if (!BACK_RECORD_GET) {
        return
      } else if (!BACK_REPORT_GET) {
        this.props.changeDoorForbid(subModule, {
          tabIndex: DOORFORBID_PAGE_TAB_REPORT
        })
      } else if (!BACK_TIME_LIST_GET) {
        this.props.changeDoorForbid(subModule, {
          tabIndex: DOORFORBID_PAGE_TAB_TIME
        })
      }
    }
  }
  render() {
    const {
      tabIndex,
      schoolId,
      buildingId,
      buildingMap,
      detail_show,
      forbiddenStatus
    } = this.props
    const tabs = this.getTabs()
    const selector1 = (
      <SchoolSelector
        key={'schoolSelector'}
        className="select-item"
        selectedSchool={schoolId}
        changeSchool={this.changeSchool}
      />
    )

    const selector2 = (
      <BasicSelector
        key="buildingSelector"
        allTitle="所有楼栋"
        selectedOpt={buildingId}
        staticOpts={buildingMap}
        changeOpt={this.changeBuilding}
      />
    )
    const { BACK_TIME_SETTING } = forbiddenStatus
    return (
      <div className="panelWrapper doorForbidWrapper" ref="wrapper">
        <PhaseLine
          value={tabIndex}
          staticPhase={tabs}
          selectors={
            tabIndex === DOORFORBID_PAGE_TAB_TIME
              ? [selector1]
              : [selector1, selector2]
          }
          changePhase={this.changeTab}
        >
          <div className="block">
            {tabIndex !== DOORFORBID_PAGE_TAB_TIME ||
            BACK_TIME_SETTING ? null : (
              <Button
                type="primary"
                className="rightBtn"
                onClick={this.settingBackDormTime}
              >
                设置归寝时间
              </Button>
            )}
          </div>
        </PhaseLine>

        {tabIndex === DOORFORBID_PAGE_TAB_RECORD ? (
          <BackDormRecordTable
            hide={this.props.hide}
            forbiddenStatus={forbiddenStatus}
          />
        ) : null}
        {tabIndex === DOORFORBID_PAGE_TAB_REPORT ? (
          <BackDormReportTable
            hide={this.props.hide}
            forbiddenStatus={forbiddenStatus}
          />
        ) : null}
        {tabIndex === DOORFORBID_PAGE_TAB_TIME ? (
          <BackDormTimeTable
            hide={this.props.hide}
            forbiddenStatus={forbiddenStatus}
          />
        ) : null}

        <div ref="detailWrapper">
          <BackDormRecordDetail
            show={detail_show}
            forbiddenStatus={forbiddenStatus}
          />
        </div>
      </div>
    )
  }
}

export default BackDormTable
