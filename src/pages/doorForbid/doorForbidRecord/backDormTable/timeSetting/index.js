import React from 'react'
import { Link } from 'react-router-dom'

import { Table } from 'antd'
import CONSTANTS from '../../../../../constants'
import Time from '../../../../../util/time'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeDoorForbid } from '../../../../../actions'

import Format from '../../../../../util/format'

const SIZE = CONSTANTS.PAGINATION
const subModule = 'backDormRecord'

class BackDormTimeTable extends React.Component {
  constructor(props) {
    super(props)

    this.state = {}

    this.columns = [
      {
        title: '学校',
        dataIndex: 'schoolName',
        width: '12%'
      },
      {
        title: '归寝时间',
        dataIndex: 'items',
        width: '30%',
        render: (text, record) => {
          return this.showBackDormTimeString(record)
        }
      },
      {
        title: '创建人',
        dataIndex: 'lastEditorName',
        width: '12%'
      },
      {
        title: '更新时间',
        dataIndex: 'updateTime',
        width: '12%',
        render: (text, record) => Time.getTimeStr(record.updateTime)
      },
      {
        title: '操作',
        dataIndex: 'operation',
        className: 'lastCol',
        render: (text, record, index) => (
          <div key={`operation${index}`} className="editable-row-operations">
            <Link
              to={{
                pathname: '/doorForbid/record/setting',
                state: { editItem: record }
              }}
            >
              编辑
            </Link>
          </div>
        )
      }
    ]
  }

  showBackDormTimeString = itemsDic => {
    let items = itemsDic.items
    console.log(items)
    var titleString = ''
    items.forEach(r => {
      var subItems = r.items

      var timeTipString = ''
      subItems.forEach(value => {
        var day = value.day
        if (timeTipString === '') {
          timeTipString += CONSTANTS.DOORFORBID_WEEK[day]
        } else {
          timeTipString += '、' + CONSTANTS.DOORFORBID_WEEK[day]
        }
      })

      if (titleString !== '') {
        titleString += ' \r ' + timeTipString
      } else {
        titleString = timeTipString
      }

      var normalString = Format.minIntToHourMinStr(r.items[0].normalTime)
      var lateString = Format.minIntToHourMinStr(r.items[0].lateTime)
      var notReturnString = Format.minIntToHourMinStr(r.items[0].notReturnTime)
      var subTitle =
        '正常归寝: ' +
        normalString +
        '~' +
        lateString +
        '、晚归: ' +
        lateString +
        '~' +
        notReturnString +
        '、未归: ' +
        notReturnString +
        '以后'

      titleString += ' \n ' + subTitle
    })
    return titleString
  }

  hourminString = timeValue => {
    var newTimeString = ''
    var hour = timeValue / 60
    if (hour < 10) {
      newTimeString
    }
  }
  changePage = pageObj => {
    let page = pageObj.current
    this.props.changeDoorForbid(subModule, { timeSetting_page: page })
  }

  render() {
    const {
      timeSetting_loading,
      timeSetting_total,
      timeSetting_page,
      timeSetting_dataSource
    } = this.props

    return (
      <div className="doorForbidTimeTab">
        <div className="tableList">
          <Table
            loading={timeSetting_loading}
            bordered
            rowKey={record => record.id}
            pagination={{
              pageSize: SIZE,
              current: timeSetting_page,
              total: timeSetting_total
            }}
            dataSource={timeSetting_dataSource}
            columns={this.columns}
            onChange={this.changePage}
          />
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  timeSetting_loading: state.doorForbidModule[subModule].timeSetting_loading,
  timeSetting_total: state.doorForbidModule[subModule].timeSetting_total,
  timeSetting_page: state.doorForbidModule[subModule].timeSetting_page,
  timeSetting_dataSource:
    state.doorForbidModule[subModule].timeSetting_dataSource
})
export default withRouter(
  connect(mapStateToProps, {
    changeDoorForbid
  })(BackDormTimeTable)
)
