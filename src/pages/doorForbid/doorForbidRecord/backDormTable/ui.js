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

const {
  DOORFORBID_PAGE_TAB_RECORD,
  DOORFORBID_PAGE_TAB_REPORT,
  DOORFORBID_PAGE_TAB_TIME,
  DOORFORBID_PAGE_TABS
} = CONSTANTS
const subModule = 'backDormRecord'

class BackDormTable extends React.Component {
  componentDidMount() {
    const { schoolId } = this.props
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

  render() {
    const {
      tabIndex,
      schoolId,
      buildingId,
      buildingMap,
      detail_show
    } = this.props
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
    return (
      <div className="doorForbidWrapper" ref="wrapper">
        <PhaseLine
          value={tabIndex}
          staticPhase={DOORFORBID_PAGE_TABS}
          selectors={
            tabIndex === DOORFORBID_PAGE_TAB_TIME
              ? [selector1]
              : [selector1, selector2]
          }
          changePhase={this.changeTab}
        >
          <div className="block">
            {tabIndex !== DOORFORBID_PAGE_TAB_TIME ? null : (
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
          <BackDormRecordTable />
        ) : null}
        {tabIndex === DOORFORBID_PAGE_TAB_REPORT ? (
          <BackDormReportTable />
        ) : null}
        {tabIndex === DOORFORBID_PAGE_TAB_TIME ? <BackDormTimeTable /> : null}

        <div ref="detailWrapper">
          <BackDormRecordDetail show={detail_show} />
        </div>
      </div>
    )
  }
}

export default BackDormTable
