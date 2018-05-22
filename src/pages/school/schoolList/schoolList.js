import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { Table, Popconfirm, Badge } from 'antd'
import AjaxHandler from '../../../util/ajax'
import Noti from '../../../util/noti'
import Time from '../../../util/time'
import CONSTANTS from '../../../constants'
import SearchLine from '../../component/searchLine'
import SchoolSelector from '../../component/schoolSelector'
import { checkObject } from '../../../util/checkSame'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeSchool } from '../../../actions'
const subModule = 'schoolList'

const { PAGINATION: SIZE, SCHOOL_TYPES } = CONSTANTS
const STATUSTEXT = {
  1: '是',
  2: '否'
}
const STATUSICON = {
  1: 'success',
  2: 'error'
}

class SchoolList extends React.Component {
  static propTypes = {
    schoolId: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired
  }

  constructor(props) {
    super(props)
    // request for schools list
    let searchingText = ''
    const dataSource = []
    let loading = false,
      total = 0
    this.state = { searchingText, dataSource, loading, total }
  }
  getColumns = () => {
    const { forbiddenStatus } = this.props
    const { SCHOOL_SETONLINE } = forbiddenStatus
    const columns = [
      {
        title: <p className="firstCol">学校名称</p>,
        dataIndex: 'name',
        width: '15%',
        render: text => <p className="firstCol">{text}</p>
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        width: '15%',
        render: text => Time.showDate(text)
      },
      {
        title: <p className="center">上线设置</p>,
        dataIndex: 'infoSet',
        className: 'infoSetLinkWrapper',
        width: '20%',
        render: (text, record) => {
          let percent = record.percent
            ? (parseFloat(record.percent, 10) * 100).toFixed(1) + '%'
            : '0%'
          return (
            <div className="infoSetLink">
              <span>信息完善度{percent}</span>
              {SCHOOL_SETONLINE ? null : (
                <Link
                  to={{
                    pathname: `/school/infoSet/:${record.id}`,
                    state: {
                      id: record.id,
                      percent: percent
                    }
                  }}
                >
                  前往设置
                </Link>
              )}
            </div>
          )
        }
      },
      {
        title: '上线状态',
        dataIndex: 'status',
        width: '8%',
        render: (text, record) => (
          <Badge
            text={record.status ? STATUSTEXT[record.status] : '否'}
            status={record.status ? STATUSICON[record.status] : 'error'}
          />
        )
      },
      {
        title: '学校类型',
        dataIndex: 'type',
        width: '10%',
        render: (text, record) => SCHOOL_TYPES[record.type] || '未知'
      },
      {
        title: <p className="lastCol">操作</p>,
        dataIndex: 'operation',
        render: (text, record, index) => (
          <div className="lastCol">
            <span>
              {forbiddenStatus.SCHOOL_ADD_OR_EDIT ? null : (
                <Fragment>
                  <Link to={`/school/list/edit/:${record.id}`}>
                    编辑学校信息
                  </Link>
                  <span className="ant-divider" />
                </Fragment>
              )}
              {forbiddenStatus.BUILDING_LIST ? null : (
                <Fragment>
                  <Link to={`/school/list/blockManage/:${record.id}`}>
                    楼栋管理
                  </Link>
                  <span className="ant-divider" />
                </Fragment>
              )}
              {forbiddenStatus.SCHOOL_BUSINESS_MANAGE ? null : (
                <Fragment>
                  <Link to={`/school/list/business/:${record.id}`}>
                    功能入口管理
                  </Link>
                  <span className="ant-divider" />
                </Fragment>
              )}
              {forbiddenStatus.DEACTIVATE_SCHOOL ? null : (
                <Popconfirm
                  title="确定要禁用此学校么?"
                  onConfirm={e => {
                    this.delete(e, record.id)
                  }}
                  onCancel={this.cancelDelete}
                  okText="确认"
                  cancelText="取消"
                >
                  <a href="">禁用</a>
                </Popconfirm>
              )}
            </span>
          </div>
        )
      }
    ]
    return columns
  }
  fetchData = body => {
    this.setState({
      loading: true
    })
    let url = '/api/school/list'
    const cb = json => {
      let nextState = {
        loading: false
      }
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        if (json.data) {
          const ds = json.data.schools.map((record, index) => {
            record.key = record.id
            return record
          })
          nextState.dataSource = ds
          nextState.total = json.data.total
          //return json
        }
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(url, body, cb)
  }
  componentDidMount() {
    console.log('school list did mount')
    /*-----------fetch data-----------*/
    let { page, schoolId } = this.props
    const body = {
      page: page,
      size: SIZE
    }
    if (schoolId !== 'all') {
      body.id = parseInt(schoolId, 10)
    }
    this.fetchData(body)
    this.props.hide(false)
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  refetch = () => {
    let { page, schoolId } = this.props
    const body = {
      page: page,
      size: SIZE
    }
    if (schoolId !== 'all') {
      body.id = parseInt(schoolId, 10)
    }
    this.fetchData(body)
  }
  delete = (e, i) => {
    let dataSource = this.state.dataSource
    let chosen = dataSource.find(r => r.id === i)
    if (chosen.status && chosen.status === 1) {
      return Noti.hintLock('禁用出错', '请先将学校下线再禁用！')
    }
    e.preventDefault()
    /*---------------post delete--------------*/
    const body = {
      id: i
    }
    let url = '/school/delete'

    const cb = json => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        if (json.data) {
          /*--------tell the parent to update list*/
          this.refetch()
        } else {
          Noti.hintError(
            '该学校不能被禁用',
            '请先将该学校绑定的设备删除再禁用！'
          )
        }
      }
    }
    AjaxHandler.ajax(url, body, cb)
  }
  cancelDelete = () => {
    // nothing
  }
  componentWillReceiveProps(nextProps) {
    if (checkObject(this.props, nextProps, ['page', 'schoolId'])) {
      return
    }
    let { page, schoolId } = nextProps
    const body = {
      page: page,
      size: SIZE
    }
    if (schoolId !== 'all') {
      body.id = parseInt(schoolId, 10)
    }
    this.fetchData(body)
  }
  changeTable = pageObj => {
    let page = pageObj.current
    this.props.changeSchool(subModule, { page: page })
  }
  changeSchool = (v, name) => {
    let { schoolId } = this.props
    if (schoolId === v) {
      return
    }
    this.props.changeSchool(subModule, { schoolId: v, page: 1 })
  }
  render() {
    const { dataSource, total, loading } = this.state
    const { page, schoolId, forbiddenStatus } = this.props
    return (
      <div className="contentArea">
        <SearchLine
          addTitle={forbiddenStatus.SCHOOL_ADD_OR_EDIT ? false : '添加学校'}
          addLink={
            forbiddenStatus.SCHOOL_ADD_OR_EDIT ? false : '/school/list/add'
          }
          selector1={
            <SchoolSelector
              selectedSchool={schoolId}
              changeSchool={this.changeSchool}
            />
          }
        />

        <div className="tableList">
          <Table
            bordered
            loading={loading}
            pagination={{ total: total, pageSize: SIZE, current: page }}
            rowClassName={() => 'schoolRow'}
            dataSource={dataSource}
            columns={this.getColumns()}
            onChange={this.changeTable}
          />
        </div>
      </div>
    )
  }
}

// export default SchoolList

const mapStateToProps = (state, ownProps) => ({
  schoolId: state.schoolModule.schoolList.schoolId,
  page: state.schoolModule.schoolList.page,
  forbiddenStatus: state.setAuthenData.forbiddenStatus
})

export default withRouter(
  connect(mapStateToProps, {
    changeSchool
  })(SchoolList)
)
