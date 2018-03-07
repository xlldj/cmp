import React from 'react'
import { Modal, Table, Button } from 'antd'

export default class MultiSelectModal extends React.Component {
  constructor(props) {
    super(props)
    const { dataSource, columns } = props
    // give a default 'select', or else it will hint 'changed a uncontrolled component to controlled'
    dataSource &&
      dataSource.forEach(d => {
        if (d.selected === undefined) {
          d.selected = false
        }
      })
    this.state = {
      dataSource: dataSource ? JSON.parse(JSON.stringify(dataSource)) : []
    }
    let localColumns = JSON.parse(JSON.stringify(columns))
    localColumns.push({
      title: '操作',
      dataIndex: 'selected',
      width: '10%',
      render: (text, record, index) => (
        <input
          type="checkbox"
          checked={record.selected}
          onChange={e => {
            this.changeSelect(e, index)
          }}
        />
      )
    })
    this.columns = localColumns
  }

  componentWillReceiveProps(nextProps) {
    nextProps.dataSource &&
      nextProps.dataSource.forEach(d => {
        if (d.selected === undefined) {
          d.selected = false
        }
      })
    this.setState({
      dataSource: nextProps.dataSource
    })
  }
  confirm = () => {
    let dataSource = JSON.parse(JSON.stringify(this.state.dataSource))
    this.props.confirm(dataSource)
  }
  cancel = () => {
    //clear all the data
    let dataSource = JSON.parse(JSON.stringify(this.state.dataSource))
    dataSource.forEach(r => (r.selected = false))
    this.setState({
      dataSource: dataSource
    })
    this.props.closeModal()
  }
  changeSelect = (e, i) => {
    let dataSource = JSON.parse(JSON.stringify(this.state.dataSource))
    dataSource[i].selected = !dataSource[i].selected
    this.setState({
      dataSource: dataSource
    })
  }
  selectRow = (record, index, event) => {
    this.changeSelect(null, index)
  }
  render() {
    const { dataSource } = this.state
    const { show } = this.props

    const selectedArr =
      dataSource && dataSource.filter((r, i) => r.selected === true)

    const selectedItems =
      selectedArr &&
      selectedArr.map((r, i) => (
        <span className="seperateItem" key={i}>
          {r.value || r.name}/
        </span>
      ))

    return (
      <Modal
        wrapClassName="modal"
        width={800}
        visible={show}
        onCancel={this.cancel}
        onOk={this.confirm}
        footer={null}
      >
        <div className="multiSelectModalHeader">
          <p className="hint">已选择:{selectedItems}</p>
          <Button
            className="rightConfirm"
            type="primary"
            onClick={this.confirm}
          >
            确定
          </Button>
        </div>
        <div className="depositGiftTable">
          <Table
            rowKey={record => record.id}
            pagination={false}
            dataSource={dataSource || []}
            columns={this.columns}
            onRowClick={this.selectRow}
          />
        </div>
      </Modal>
    )
  }
}
