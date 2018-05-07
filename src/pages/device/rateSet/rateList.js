import React from 'react'
import { Link } from 'react-router-dom'

import { Table, Popconfirm } from 'antd'

import AjaxHandler from '../../../util/ajax'
import Noti from '../../../util/noti'
import Time from '../../../util/time'
import SearchLine from '../../component/searchLine'
import SchoolSelector from '../../component/schoolSelector'
import CONSTANTS from '../../../constants'
import { checkObject } from '../../../util/checkSame'
import { mul } from '../../../util/numberHandle'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeDevice } from '../../../actions'
const subModule = 'rateSet'
const {
  DEVICE_TYPE_WASHER,
  DEVICE_TYPE_DRINKER,
  DEVICE_TYPE_BLOWER,
  WASHER_RATE_TYPES,
  DEVICE_AGREEMENT_B
} = CONSTANTS

const SIZE = CONSTANTS.PAGINATION

const typeName = CONSTANTS.DEVICETYPE

class RateList extends React.Component {
  static propTypes = {
    schoolId: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired
  }
  constructor(props) {
    super(props)
    this.state = {
      dataSource: [],
      loading: false,
      total: 0,
      suppliers: {}
    }
  }
  componentDidMount() {
    this.props.hide(false)
    let { page, schoolId } = this.props
    const body = {
      page: page,
      size: SIZE
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    this.fetchData(body)
    this.fetchSuppliers()
  }
  fetchSuppliers = () => {
    const resource = '/supplier/query/list'
    const body = {
      page: 1,
      size: 100
    }
    const cb = json => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        if (json.data) {
          const suppliers = {},
            nextState = {}
          for (let i = 0; i < json.data.total; i++) {
            suppliers[json.data.supplierEntities[i].id] =
              json.data.supplierEntities[i]
          }
          nextState.suppliers = suppliers
          this.setState(nextState)
        } else {
          throw new Error('网络出错，获取供应商列表失败，请稍后重试～')
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  componentWillReceiveProps(nextProps) {
    if (checkObject(this.props, nextProps, ['page', 'schoolId'])) {
      return
    }
    const { page, schoolId } = nextProps
    const body = {
      page: page,
      size: SIZE
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    this.fetchData(body)
  }

  fetchData = body => {
    this.setState({
      loading: true
    })
    const resource = '/rate/list'
    const cb = json => {
      const nextState = { loading: false }
      if (json.error) {
        this.setState(nextState)
        throw new Error(json.error.displayMessage || json.error)
      } else {
        /*--------redirect --------*/
        if (json.data) {
          nextState.dataSource = json.data.rateDetails
          nextState.total = json.data.total
        }
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  delete = (e, id) => {
    const resource = '/api/rate/delete'
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
          if (this.props.schoolId !== 'all') {
            body.schoolId = parseInt(this.props.schoolId, 10)
          }
          this.fetchData(body)
        } else {
          Noti.hintError('当前费率不能被删除！', '请联系管理员删除')
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  changePage = pageObj => {
    const page = pageObj.current
    this.props.changeDevice(subModule, { page: page })
  }
  changeSchool = value => {
    const { schoolId } = this.props
    if (schoolId === value) {
      return
    }
    this.props.changeDevice(subModule, { page: 1, schoolId: value })
  }
  render() {
    const { dataSource, loading, total, suppliers } = this.state
    const { page, schoolId } = this.props
    const columns = [
      {
        title: '学校',
        dataIndex: 'schoolName',
        className: 'firstCol',
        width: '17%'
      },
      {
        title: '设备类型',
        dataIndex: 'deviceType',
        width: '13%',
        render: (text, r) => typeName[r.deviceType]
      },
      {
        title: '供应商',
        dataIndex: 'supplierId',
        width: '13%',
        render: (text, r) =>
          r.supplierId && this.state.suppliers[r.supplierId]
            ? this.state.suppliers[r.supplierId].name
            : ''
      },
      {
        title: '费率',
        dataIndex: 'rates',
        width: '24%',
        render: (text, record, index) => {
          // washer's denomination is 'YUAN', doesn't need to mul by 100.
          const washerItems =
            record.deviceType === DEVICE_TYPE_WASHER
              ? record.rateGroups &&
                record.rateGroups.map((r, i) => (
                  <li key={i}>
                    <span key={i}>{`${WASHER_RATE_TYPES[r.pulse]}模式: ${
                      r.price ? r.price : ''
                    }元钱`}</span>
                  </li>
                ))
              : null
          const agreementB =
            suppliers[record.supplierId] &&
            suppliers[record.supplierId].agreement === DEVICE_AGREEMENT_B &&
            (record.deviceType === DEVICE_TYPE_WASHER ||
              record.deviceType === DEVICE_TYPE_DRINKER)
          console.log(suppliers, record.supplierId, agreementB)
          const items = record.rateGroups.map((r, i) => {
            const denomination =
              record.deviceType === DEVICE_TYPE_BLOWER ? '秒' : '脉冲'
            const unitPrice =
              (record.deviceType === DEVICE_TYPE_WASHER ||
                record.deviceType === DEVICE_TYPE_DRINKER) &&
              record.unitPrice
                ? `1升水/${mul(record.unitPulse, 100)}分钱、`
                : ''
            return (
              <li key={i}>
                <span key={i}>
                  扣费：
                  {agreementB
                    ? `1升水/${r.unitPulse}${denomination}、`
                    : unitPrice || ''}
                  {r.price ? mul(r.price, 100) : ''}分钱/{r.pulse || ''}
                  {denomination}
                </span>
              </li>
            )
          })
          return (
            <ul>
              {record.deviceType === DEVICE_TYPE_WASHER ? washerItems : items}
            </ul>
          )
        }
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        width: '17%',
        render: (text, r, i) => {
          return Time.getTimeStr(r.createTime)
        }
      },
      {
        title: <p className="lastCol">操作</p>,
        dataIndex: 'operation',
        render: (text, record, index) => (
          <div className="editable-row-operations lastCol">
            <span>
              <Link to={`/device/rateSet/rateInfo/:${record.id}`}>编辑</Link>
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
    return (
      <div className="contentArea">
        <SearchLine
          addTitle="创建费率"
          addLink="/device/rateSet/addRate"
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
            rowKey={record => record.id}
            pagination={{ pageSize: SIZE, current: page, total: total }}
            onChange={this.changePage}
            dataSource={dataSource}
            columns={columns}
          />
        </div>
        <div />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  page: state.deviceModule[subModule].page,
  schoolId: state.deviceModule[subModule].schoolId
})

export default withRouter(
  connect(mapStateToProps, {
    changeDevice
  })(RateList)
)
