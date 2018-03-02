import React from 'react'
import { Link } from 'react-router-dom'

import { Table, Popconfirm } from 'antd'
import AjaxHandler from '../../../util/ajax'
import Noti from '../../../util/noti'
import SearchLine from '../../component/searchLine'
import CONSTANTS from '../../../constants'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeDevice } from '../../../actions'
const subModule = 'components'

const SIZE = CONSTANTS.PAGINATION

class ComponentTable extends React.Component {
  static propTypes = {
    page: PropTypes.number.isRequired
  }
  constructor(props) {
    super(props)
    let dataSource = [],
      componentTypes = [],
      total = 0,
      loading = false
    this.state = {
      dataSource,
      componentTypes,
      total,
      loading
    }
    this.columns = [
      {
        title: '设备类型',
        dataIndex: 'deviceType',
        width: '20%',
        className: 'firstCol',
        render: (text, record, index) => CONSTANTS.DEVICETYPE[record.deviceType]
      },
      {
        title: '配件类型',
        dataIndex: 'type',
        width: '20%'
      },
      {
        title: '配件型号',
        dataIndex: 'model',
        width: '40%'
      },
      {
        title: <p className="lastCol">操作</p>,
        dataIndex: 'operation',
        render: (text, record, index) => (
          <div className="editable-row-operations lastCol">
            <span>
              <Link to={`/device/components/editComponent/:${record.id}`}>
                编辑
              </Link>
              <span className="ant-divider" />
              <Popconfirm
                title="确定要删除此么?"
                onConfirm={e => {
                  this.delete(e, record.id)
                }}
                okText="确认"
                cancelText="取消"
              >
                <a href="">删除</a>
              </Popconfirm>
            </span>
          </div>
        )
      }
    ]
  }

  fetchData = body => {
    this.setState({
      loading: true
    })
    let resource = '/api/device/component/list'
    const cb = json => {
      let nextState = { loading: false }
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        /*--------redirect --------*/
        if (json.data) {
          nextState.dataSource = json.data.components
          nextState.total = json.data.total
        } else {
          this.setState(nextState)
          throw new Error('网络出错，请稍后重试～')
        }
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb)
  }

  componentDidMount() {
    this.props.hide(false)
    let { page } = this.props
    const body = {
      page: page,
      size: SIZE
    }
    this.fetchData(body)
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  componentWillReceiveProps(nextProps) {
    let { page } = nextProps
    const body = {
      page: page,
      size: SIZE
    }
    this.fetchData(body)
  }

  delete = (e, id) => {
    e.preventDefault()
    let resource = '/api/device/component/delete'
    const body = {
      id: id
    }
    const cb = json => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        if (json.data) {
          const body = {
            page: this.props.page,
            size: SIZE
          }
          this.fetchData(body)
        } else {
          Noti.hintError('当前配件不能被删除', '请咨询相关人员！')
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  changePage = pageObj => {
    let page = pageObj.current
    this.props.changeDevice(subModule, { page: page })
  }

  render() {
    const { dataSource, total, loading } = this.state
    const { page } = this.props

    return (
      <div className="contentArea">
        <SearchLine
          addTitle="配件类型管理"
          addLink="/device/components/componentType"
          addTitle2="添加配件"
          addLink2="/device/components/addComponent"
        />

        <div className="tableList">
          <Table
            bordered
            loading={loading}
            rowKey={record => record.id}
            pagination={{ pageSize: SIZE, total: total, current: page }}
            onChange={this.changePage}
            dataSource={dataSource}
            columns={this.columns}
          />
        </div>
      </div>
    )
  }
}

// export default ComponentTable

const mapStateToProps = (state, ownProps) => ({
  page: state.deviceModule[subModule].page
})

export default withRouter(
  connect(mapStateToProps, {
    changeDevice
  })(ComponentTable)
)
