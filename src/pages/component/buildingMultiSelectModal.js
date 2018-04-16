import React from 'react'
import { Table, Button, Modal } from 'antd'

import { checkObject } from '../../util/checkSame'
import { fetchBuildings } from '../../actions'
import { connect } from 'react-redux'

class BuildingMultiSelectModal extends React.Component {
  constructor(props) {
    super(props)
    // find the buildings in schools props to set default items
    let { buildingsOfSchoolId, schoolId, selectedItems, all } = this.props

    if (!buildingsOfSchoolId[schoolId] && schoolId !== 'all') {
      this.props.fetchBuildings(+schoolId)
    }
    let dataSource = buildingsOfSchoolId[schoolId] || []
    if (all) {
      dataSource.forEach(r => {
        r.selected = true
      })
    } else if (selectedItems) {
      selectedItems.forEach(r => {
        let building = dataSource.find(rec => rec.id === parseInt(r.id, 10))
        building.selected = true
      })
    }

    this.state = {
      dataSource,
      searchingText: '',
      all
    }

    this.columns = [
      {
        title: <p>楼栋名称</p>,
        dataIndex: 'name'
      },
      {
        title: <p style={{ textAlign: 'center' }}>操作</p>,
        dataIndex: 'selected',
        width: '100px',
        className: 'center',
        render: (text, record, index) => (
          <input
            type="checkbox"
            checked={record.selected}
            onChange={e => {
              this.changeSelect(e, index)
            }}
          />
        )
      }
    ]
  }

  componentDidMount() {
    // console.log(this.props.schools);
  }
  componentWillReceiveProps(nextProps) {
    // if 'schoolId' and 'selectedItems' are changed, check if need to rechange 'state.dataSource'
    // if schoolId is changed, and buildings are not ready, need to refetch buildings
    // after got buildings, need to change 'dataSource'
    if (
      checkObject(this.props, nextProps, [
        'schoolId',
        'selectedItems',
        'buildingsOfSchoolId'
      ])
    ) {
      return
    }

    const { schoolId, buildingsOfSchoolId } = nextProps
    // if 'buildings' are not ready, fetch and return
    if (!buildingsOfSchoolId[+schoolId]) {
      return this.props.fetchBuildings(+schoolId)
    }

    // change dataSource,
    this.updateDataSource(nextProps)
  }
  updateDataSource = props => {
    const { schoolId, selectedItems, buildingsOfSchoolId, all } =
      props || this.props
    //  buildingsOfSchoolId[+schoolId] should always exist
    let dataSource = buildingsOfSchoolId[schoolId] || []
    if (all) {
      dataSource.forEach(r => {
        r.selected = true
      })
    } else if (selectedItems) {
      selectedItems.forEach(r => {
        let building = dataSource.find(rec => rec.id === parseInt(r.id, 10))
        building.selected = true
      })
    }

    this.setState({
      dataSource
    })
  }
  confirm = () => {
    let { dataSource, all } = this.state
    this.props.confirmBuildings({
      all,
      dataSource
    })
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
    let nextState = {
      dataSource: dataSource
    }
    if (this.state.all) {
      // if 'all', must be false after change
      nextState.all = false
    } else {
      let all = dataSource.every(r => r.selected === true)
      if (all) {
        nextState.all = true
      }
    }
    // if the last selected item, don't deselect it.
    let noneSelected = dataSource.every(r => r.selected === false)
    if (noneSelected) {
      return
    }
    this.setState(nextState)
  }
  selectRow = (record, index, event) => {
    this.changeSelect(null, index)
  }
  selectAll = () => {
    this.props.confirmBuildings({
      all: true,
      dataSource: this.state.dataSource
    })
  }
  render() {
    const { dataSource, all } = this.state

    const selectedBuildings =
      dataSource && dataSource.filter(d => d.selected === true)

    const selectedBuildingItems =
      selectedBuildings &&
      selectedBuildings.map((r, i) => (
        <span className="seperateItem" key={i}>
          {r.name}/
        </span>
      ))

    return (
      <Modal
        wrapClassName="modal"
        width={800}
        title=""
        visible={true}
        onCancel={this.cancel}
        onOk={this.confirm}
        okText=""
        footer={null}
      >
        <div className="multiSelect_header">
          <p style={{ marginBottom: '10px' }}>
            当前已选择的楼栋:{all ? '所有楼栋' : selectedBuildingItems}
          </p>
          <div>
            <Button className="mgr10" onClick={this.selectAll}>
              所有楼栋
            </Button>
            <Button
              className="rightConfirm"
              type="primary"
              onClick={this.confirm}
            >
              确定
            </Button>
          </div>
        </div>
        <div className="depositGiftTable">
          <Table
            rowKey={record => record.id}
            pagination={false}
            dataSource={dataSource}
            columns={this.columns}
            onRowClick={this.selectRow}
          />
        </div>
      </Modal>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  buildingsOfSchoolId: state.buildingsSet.buildingsOfSchoolId
})

export default connect(mapStateToProps, { fetchBuildings })(
  BuildingMultiSelectModal
)
