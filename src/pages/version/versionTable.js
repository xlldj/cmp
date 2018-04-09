import React from 'react'
import { Table } from 'antd'
import { Link } from 'react-router-dom'
import AjaxHandler from '../../util/ajax'
import Time from '../../util/time'
import SearchLine from '../component/searchLine'
import CONSTANTS from '../../constants'
import { checkObject } from '../../util/checkSame'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeVersion } from '../../actions'
const subModule = 'version'

const SIZE = CONSTANTS.PAGINATION
const UPDATE = CONSTANTS.UPDATETYPE

class VersionTable extends React.Component {
  static propTypes = {
    page: PropTypes.number.isRequired
  }
  constructor(props) {
    super(props)
    let dataSource = []
    this.state = {
      dataSource,
      loading: false,
      total: 0
    }
    this.columns = [
      {
        title: '版本号',
        dataIndex: 'versionNo',
        width: '10%',
        className: 'firstCol'
      },
      {
        title: '环境',
        dataIndex: 'envType',
        width: '8%',
        render: (text, record) => CONSTANTS.VERSIONENV[record.envType]
      },
      {
        title: '更新方式',
        dataIndex: 'type',
        width: '10%',
        render: (text, record) => UPDATE[record.type]
      },
      {
        title: '系统',
        dataIndex: 'system',
        width: '8%',
        render: (text, record) => CONSTANTS.SYSTEMS[record.system]
      },
      {
        title: '地址',
        dataIndex: 'url',
        width: '20%'
      },
      {
        title: '更新内容',
        dataIndex: 'content',
        width: '28%'
      },
      {
        title: '更新时间',
        dataIndex: 'updateTime',
        render: (text, record) => Time.getTimeStr(record.updateTime)
      },
      {
        title: <p className="lastCol">操作</p>,
        dataIndex: 'operation',
        width: '8%',
        render: (text, record, index) => (
          <div className="editable-row-operations lastCol">
            <span>
              <Link to={`/version/detail/:${record.id}`}>编辑</Link>
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
    let resource = '/version/list'
    const cb = json => {
      let nextState = { loading: false }
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        /*--------redirect --------*/
        if (json.data) {
          nextState.dataSource = json.data.versions
          nextState.total = json.data.total
          if (body.page === 1) {
            nextState.page = 1
          }
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
    if (checkObject(this.props, nextProps, ['page'])) {
      return
    }
    let { page } = nextProps
    const body = {
      page: page,
      size: SIZE
    }
    this.fetchData(body)
  }
  changePage = pageObj => {
    let page = pageObj.current
    this.props.changeVersion(subModule, { page: page })
  }

  render() {
    const { dataSource, total, loading } = this.state
    const { page } = this.props

    return (
      <div className="contentArea">
        <SearchLine addTitle="添加新版本" addLink="/version/add" />

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
  page: state.versionModule[subModule].page
})

export default withRouter(
  connect(mapStateToProps, {
    changeVersion
  })(VersionTable)
)
