import React from 'react'

import { Table } from 'antd'
import CheckSelect from '../../../../component/checkSelect'
import CONSTANTS from '../../../../../constants'
import SearchInput from '../../../../component/searchInput'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeDoorForbid } from '../../../../../actions'

const {
  DOORFORBID_ORDER,
  PAGINATION: SIZE,
  DOORFORBID_REPORT_TIME
  // DOORFORBID_SEX
} = CONSTANTS
const subModule = 'backDormRecord'

class BackDormReportTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      searchingText: ''
    }
    this.columns = [
      {
        title: '姓名',
        dataIndex: 'name',
        className: 'firstCol'
      },
      {
        title: '学号',
        dataIndex: 'studentNo',
        width: '12%'
      },
      {
        title: '手机号',
        dataIndex: 'mobile',
        width: '12%'
      },
      {
        title: '性别',
        dataIndex: 'sex',
        width: '8%',
        render: (text, record) => (record.sex === 1 ? '男' : '女')
      },
      {
        title: '宿舍',
        dataIndex: 'dormitory',
        width: '8%'
      },
      {
        title: '总打卡次数',
        dataIndex: 'total',
        width: '8%',
        sorter: true
      },
      {
        title: '异常打卡次数',
        dataIndex: 'abnormal',
        width: '8%',
        sorter: true
      },
      {
        title: '正常归寝次数',
        dataIndex: 'normal',
        width: '8%',
        sorter: true
      },
      {
        title: '晚归次数',
        dataIndex: 'late',
        width: '8%',
        sorter: true
      },

      {
        title: '未归次数',
        dataIndex: 'notReturn',
        width: '8%'
      }
    ]
  }

  changeTable = (pageObj, filters, sorter) => {
    console.log(sorter)
    let { order, field } = sorter
    let { report_order, report_orderBy } = this.props
    if (order) {
      report_orderBy = field
      report_order = DOORFORBID_ORDER[order]
    } else {
      report_orderBy = ''
      report_order = 0
    }
    let page = pageObj.current

    this.props.changeDoorForbid(subModule, {
      report_page: page,
      report_orderBy: report_orderBy,
      report_order: report_order
    })
  }
  changePage = pageObj => {
    let page = pageObj.current
    this.props.changeDoorForbid(subModule, { report_page: page })
  }

  settingBackDormTime = v => {}

  searchEnter = () => {
    let { report_searchKey } = this.props
    let searchingText = this.state.searchingText.trim()
    if (report_searchKey !== searchingText) {
      this.props.changeDoorForbid(subModule, {
        report_searchKey: searchingText,
        page: 1
      })
    }
  }
  changeSearch = e => {
    this.setState({
      searchingText: e.target.value
    })
  }

  changeSexType = e => {
    let { report_sexType } = this.props
    if (report_sexType !== e) {
      this.props.changeDoorForbid(subModule, {
        report_sexType: e,
        page: 1
      })
    }
  }

  changeTimeType = e => {
    let { report_timeType } = this.props
    if (report_timeType !== e) {
      this.props.changeDoorForbid(subModule, {
        report_timeType: e,
        page: 1
      })
    }
  }
  render() {
    const {
      report_loading,
      report_total,
      report_page,
      report_dataSource,
      report_timeType
      // report_sexType
    } = this.props
    const { searchingText } = this.state
    return (
      <div className="doorForbidReportTab">
        <div className="queryPanel">
          <div className="queryLine">
            <div className="block">
              <span>时间筛选:</span>
              <CheckSelect
                options={DOORFORBID_REPORT_TIME}
                value={report_timeType}
                onClick={this.changeTimeType}
              />
            </div>
            <div className="doorForbidSearchBox">
              <SearchInput
                placeholder="姓名/手机号/宿舍"
                searchingText={searchingText}
                pressEnter={this.searchEnter}
                changeSearch={this.changeSearch}
              />
            </div>
          </div>

          {/* <div className="queryLine">
            <div className="block">
              <span>性别筛选:</span>
              <CheckSelect
                options={DOORFORBID_SEX}
                value={report_sexType}
                onClick={this.changeSexType}
              />
            </div>
          </div> */}
        </div>

        <div className="tableList">
          <Table
            loading={report_loading}
            bordered
            rowKey={record => record.id}
            pagination={{
              pageSize: SIZE,
              current: report_page,
              total: report_total
            }}
            dataSource={report_dataSource}
            columns={this.columns}
            onChange={this.changeTable}
          />
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  report_loading: state.doorForbidModule[subModule].report_loading,
  report_total: state.doorForbidModule[subModule].report_total,
  report_page: state.doorForbidModule[subModule].report_page,
  report_dataSource: state.doorForbidModule[subModule].report_dataSource,
  report_searchKey: state.doorForbidModule[subModule].report_searchKey,
  report_timeType: state.doorForbidModule[subModule].report_timeType,
  report_sexType: state.doorForbidModule[subModule].report_sexType,
  report_orderBy: state.doorForbidModule[subModule].report_orderBy,
  report_order: state.doorForbidModule[subModule].report_order
})
export default withRouter(
  connect(mapStateToProps, {
    changeDoorForbid
  })(BackDormReportTable)
)
