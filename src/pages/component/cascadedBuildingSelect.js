import React, { Component, Fragment } from 'react'
import { Button } from 'antd'
import MultiSelectModal from './multiSelectModal'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { fetchResidence } from '../../actions'

class CascadedBuildingSelect extends Component {
  state = {
    zoneNames: '全部区域',
    showZoneSelect: false,
    showBuildingSelect: false,
    showFloorSelect: false,
    zoneIds: 'all',
    buildingIds: 'all',
    floorIds: 'all'
  }
  getColumns = name => {
    return [
      {
        title: name,
        dataIndex: 'name',
        width: '75%'
      }
    ]
  }
  showModal = (e, name) => {
    const nextState = {}
    nextState[name] = true
    this.setState(nextState)
  }
  confirmBuildings = ({ all, dataSource }) => {
    this.setState({
      showBuildingSelect: false
    })
    let buildingIds = all
      ? 'all'
      : dataSource.filter(d => d.selected === true).map(d => d.id)
    this.props.confirmBuildings(all, buildingIds)
  }
  closeModal = (e, name) => {
    const nextState = {}
    nextState[name] = false
    this.setState(nextState)
  }
  getBuildingOptions = data => {
    const { zoneIds, buildingIds, floorIds } = this.state
    const { residence } = this.props
    // 区域的选项总是全部的条目
    const zoneDataSource =
      residence &&
      residence.map(r => {
        return { id: r.id, name: r.name, selected: true }
      })
    // 如果区域为所有，则楼栋和楼层都只有一个全部选项
    if (zoneIds === 'all') {
      return {
        zone: { dataSource: zoneDataSource, name: '全部区域' },
        building: { dataSource: [], name: '全部楼栋' },
        floor: { dataSource: [], name: '全部楼层' }
      }
    }
    let zoneNames = '',
      buildingNames = '',
      floorNames = ''
    const buildingDataSource = []
    const floorDataSource = []
    // 区域不为所有，选择楼栋的选项。同时设置楼层的选项。
    zoneIds.forEach(zoneId => {
      const zone = residence.find(r => r.id === zoneId)
      zoneNames += zone.name || ''
      if (zone && zone.children) {
        const buildings = zone.children
        buildings.forEach(building => {
          // buildingDataSource.push({ id: building.id, name: building.name, selected: true })
          const buildingItem = {
            id: building.id,
            name: building.name,
            selected: true
          }
          if (buildingIds !== 'all') {
            const selected = buildingIds.some(b => b.id === building.id)
            // 如果该楼栋在所选择的buildingIds内,
            if (selected) {
              buildingNames += building.name || ''
              const floors = building.children
              floors.forEach(f => {
                const floorItem = { id: f.id, name: f.name, selected: true }
                if (floorIds !== 'all') {
                  const isFloorSelected = floorIds.some(
                    selectedFloor => selectedFloor.id === f.id
                  )
                  // 如果楼层在所选择的floorIds内，添加到名字中
                  if (isFloorSelected) {
                    floorNames += f.name || ''
                  } else {
                    floorItem.selected = false
                  }
                }
                floorDataSource.push({ id: f.id, name: f.name })
              })
            } else {
              // 将对应楼栋的selected改为false
              buildingItem.selected = false
            }
          }
          buildingDataSource.push(buildingItem)
        })
      }
    })
    const buildingNameStr = buildingIds === 'all' ? '全部楼栋' : buildingNames
    const floorOptionData = buildingIds === 'all' ? [] : floorDataSource
    const floorNameStr = floorIds === 'all' ? '全部楼层' : floorNames
    return {
      zone: { dataSource: zoneDataSource, name: zoneNames },
      building: { dataSource: buildingDataSource, name: buildingNameStr },
      floor: {
        dataSource: floorOptionData,
        name: floorNameStr
      }
    }
  }

  setItems = (dataSource, idStateName, showModalStateName) => {
    const data = JSON.parse(JSON.stringify(dataSource))
    const selectedIds = data.filter(r => r.selected === true).map(r => r.id)
    const nextState = {}
    nextState[idStateName] = selectedIds
    nextState[showModalStateName] = false
    this.setState(nextState)
  }

  render() {
    const {
      showZoneSelect,
      showBuildingSelect,
      showFloorSelect,
      zoneIds,
      buildingIds
    } = this.state
    const { zone, building, floor } = this.getBuildingOptions()

    return (
      <Fragment>
        <span className="customized_select_option">{zone.name}</span>
        <Button
          type="primary"
          onClick={e => this.showModal(e, 'showZoneSelect')}
        >
          点击选择
        </Button>
        <span className="customized_select_option">{building.name}</span>
        <Button
          type="primary"
          disabled={zoneIds === 'all'}
          onClick={e => this.showModal(e, 'showBuildingSelect')}
        >
          点击选择
        </Button>
        <span className="customized_select_option">{floor.name}</span>
        <Button
          type="primary"
          disabled={buildingIds === 'all'}
          onClick={e => this.showModal(e, 'showFloorSelect')}
        >
          点击选择
        </Button>
        {showZoneSelect ? (
          <MultiSelectModal
            width={450}
            suportAllChoose
            closeModal={e => this.closeModal(e, 'showZoneSelect')}
            confirm={data => this.setItems(data, 'zoneIds', 'showZoneSelect')}
            show={showZoneSelect}
            dataSource={zone.dataSource}
            columns={this.getColumns('区域')}
          />
        ) : null}
        {showBuildingSelect ? (
          <MultiSelectModal
            closeModal={e => this.closeModal(e, 'showBuildingSelect')}
            confirm={this.setBuildingItems}
            show={showBuildingSelect}
            dataSource={building.data}
            columns={this.getColumns('楼栋')}
          />
        ) : null}
        {showFloorSelect ? (
          <MultiSelectModal
            closeModal={e => this.closeModal(e, 'showFloorSelect')}
            confirm={this.setFloorItems}
            show={showFloorSelect}
            dataSource={floor.dataSource}
            columns={this.getColumns('楼层')}
          />
        ) : null}
      </Fragment>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    residence: state.buildingsSet.residenceOfSchoolId[ownProps.schoolId] || []
  }
}

export default withRouter(
  connect(mapStateToProps, {
    fetchResidence
  })(CascadedBuildingSelect)
)
