import React from 'react'
import { Link } from 'react-router-dom'

import Table from 'antd/lib/table'
import Popconfirm from 'antd/lib/popconfirm'

import Noti from '../../util/noti'
import Time from '../../util/time'
import AjaxHandler from '../../util/ajax'
import DeviceSelector from '../component/deviceSelector'
import SearchLine from '../component/searchLine'
import CONSTANTS from '../../constants'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeGift } from '../../actions'
import { checkObject } from '../../util/checkSame'
const subModule = 'giftList'

const typeName = CONSTANTS.DEVICETYPE
const SIZE = CONSTANTS.PAGINATION

class GiftTable extends React.Component {
  static propTypes = {
    deviceType: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired
  }
  constructor(props) {
    super(props)
    let dataSource = []
    this.state = {
      dataSource,
      loading: false,
      page: 1
    }
    this.columns = [
      {
        title: '红包金额',
        dataIndex: 'amount',
        className: 'firstCol',
        width: '25%',
        render: text => `¥${text}`
      },
      {
        title: '使用期限',
        dataIndex: 'timeLimit',
        width: '25%',
        render: (text, record) => {
          if (record.type === 1) {
            return (
              <span>
                {Time.showDate(record.startTime)}~{Time.showDate(
                  record.endTime
                )}
              </span>
            )
          } else {
            return <span>{record.timeLimit}天</span>
          }
        }
      },
      {
        title: '设备类型',
        dataIndex: 'deviceType',
        width: '25%',
        render: (text, record, index) => typeName[record.deviceType]
      },
      {
        title: '操作',
        dataIndex: 'operation',
        className: 'lastCol',
        render: (text, record, index) => (
          <div className="editable-row-operations">
            <Link to={`/gift/list/giftInfo/:${record.id}`}>编辑</Link>
            <span className="ant-divider" />
            <Popconfirm
              title="确定要失效此红包么?"
              onConfirm={e => {
                this.delete(e, record.id)
              }}
              okText="确认"
              cancelText="取消"
            >
              <a href="">失效</a>
            </Popconfirm>
          </div>
        )
      }
    ]
  }

  fetchData = body => {
    this.setState({
      loading: true
    })
    let resource = '/api/gift/list'
    const cb = json => {
      let nextState = { loading: false }
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        /*--------redirect --------*/
        if (json.data) {
          nextState.dataSource = json.data.gifts
          nextState.total = json.data.total
        } else {
          this.setState(nextState)
        }
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb, this.errorHandler)
  }
  errorHandler = () => {
    this.setState({
      loading: false
    })
  }

  componentDidMount() {
    this.props.hide(false)

    let { page, deviceType } = this.props
    const body = {
      page: page,
      size: SIZE
    }
    if (deviceType !== 'all') {
      body.deviceType = parseInt(deviceType, 10)
    }
    this.fetchData(body)
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  componentWillReceiveProps(nextProps) {
    if (checkObject(this.props, nextProps, ['page', 'deviceType'])) {
      return
    }
    let { page, deviceType } = nextProps
    const body = {
      page: page,
      size: SIZE
    }
    if (deviceType !== 'all') {
      body.deviceType = parseInt(deviceType, 10)
    }
    this.fetchData(body)
  }
  changeDevice = value => {
    let { deviceType } = this.props
    if (deviceType === value) {
      return
    }
    this.props.changeGift(subModule, { page: 1, deviceType: value })
  }
  delete = (e, id) => {
    e.preventDefault()
    let url = '/api/gift/delete'
    const body = {
      id: id
    }
    const cb = json => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        /*--------redirect --------*/
        if (json.data) {
          const body = {
            page: this.props.page,
            size: SIZE
          }
          this.fetchData(body)
        } else {
          Noti.hintLock('请求出错', '当前红包还不能被设为失效')
        }
      }
    }
    AjaxHandler.ajax(url, body, cb)
  }
  changePage = pageObj => {
    let page = pageObj.current
    this.props.changeGift(subModule, { page: page })
  }

  render() {
    const { dataSource, total, loading } = this.state
    const { page, deviceType } = this.props

    return (
      <div className="contentArea">
        <SearchLine
          addTitle="创建红包"
          addLink="/gift/list/addGift"
          selector1={
            <DeviceSelector
              selectedDevice={deviceType}
              changeDevice={this.changeDevice}
            />
          }
        />

        <div className="tableList">
          <Table
            bordered
            loading={loading}
            rowKey={record => record.id}
            pagination={{ pageSize: SIZE, current: page, total: total }}
            dataSource={dataSource}
            columns={this.columns}
            onChange={this.changePage}
          />
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  deviceType: state.giftModule[subModule].deviceType,
  page: state.giftModule[subModule].page
})

export default withRouter(
  connect(mapStateToProps, {
    changeGift
  })(GiftTable)
)
