import React from 'react'
import CONSTANTS from '../../constants'
import Time from '../../util/time'
import { Table, Modal, Button } from 'antd'

import { connect } from 'react-redux'
import { fetchGifts } from '../../actions'

const { DEVICETYPE } = CONSTANTS

class GiftTable extends React.Component {
  constructor(props) {
    super(props)
    let dataSource = []
    this.state = {
      dataSource,
      deviceType: 1,
      selectedRowKeys: [],
      giftNotSelected: false
    }
    this.columns = [
      {
        title: <p style={{ textAlign: 'center' }}>设备类型</p>,
        width: '25%',
        dataIndex: 'deviceType',
        render: (text, record, index) => DEVICETYPE[record.deviceType],
        className: 'center'
      },
      {
        title: <p style={{ textAlign: 'center' }}>红包名称</p>,
        dataIndex: 'name',
        width: '18%',
        className: 'center'
      },
      {
        title: <p style={{ textAlign: 'center' }}>红包金额</p>,
        dataIndex: 'amount',
        width: '15%',
        render: text => `¥${text}`,
        className: 'center'
      },
      {
        title: <p style={{ textAlign: 'center' }}>使用期限（领取日起）</p>,
        dataIndex: 'timeLimit',
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
        },
        className: 'center'
      }
    ]
  }
  componentDidMount() {
    let { giftSet } = this.props
    if (!giftSet) {
      this.props.fetchGifts()
    }
  }
  componentWillReceiveProps(nextProps) {
    let nextState = {}
    let dataSource = []
    if (nextProps.deviceType !== this.state.deviceType) {
      nextState.deviceType = nextProps.deviceType
      // filter by devicetype
      dataSource = this.props.gifts.filter(
        g => g.deviceType === nextProps.deviceType
      )
      nextState.dataSource = dataSource
    }
    if (nextProps.selectedGiftId && nextProps.selectedGiftId !== 0) {
      nextState.selectedRowKeys = [parseInt(nextProps.selectedGiftId, 10)]
    } else {
      nextState.selectedRowKeys = []
    }
    this.setState(nextState)
  }
  confirm = () => {
    // this.props.closeModal()
    let { selectedRowKeys } = this.state
    if (selectedRowKeys.length === 0) {
      return this.setState({
        giftNotSelected: true
      })
    }
    this.props.setGift({
      // since only choose one, set
      giftId: this.state.selectedRowKeys[0]
    })
  }
  cancel = () => {
    this.setState({
      selectedRowKeys: []
    })
    this.props.closeModal()
  }
  selectRow = (record, index, event) => {
    let selectedRows = [record]
    this.changeSelect(null, selectedRows)
  }
  changeSelect = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedRowKeys: [selectedRows[0].id]
    })
  }
  render() {
    const { dataSource, selectedRowKeys, giftNotSelected } = this.state

    return (
      <Modal
        wrapClassName="modal"
        width={800}
        title=""
        visible={this.props.showModal}
        onCancel={this.cancel}
        onOk={this.confirm}
        okText=""
        footer={null}
      >
        <div className="giftStatus">
          <Button type="primary" onClick={this.confirm}>
            确定
          </Button>
          {giftNotSelected ? (
            <span className="checkInvalid">请选择红包后再确认！</span>
          ) : null}
        </div>
        <div className="depositGiftTable">
          <Table
            rowKey={record => record.id}
            dataSource={dataSource}
            columns={this.columns}
            onRowClick={this.selectRow}
            rowSelection={{
              type: 'radio',
              onChange: this.changeSelect,
              selectedRowKeys: selectedRowKeys
            }}
            pagination={{ defaultPageSize: 8 }}
          />
        </div>
      </Modal>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  giftSet: state.setGifts.giftSet,
  gifts: state.setGifts.gifts
})

export default connect(mapStateToProps, {
  fetchGifts
})(GiftTable)
