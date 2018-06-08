import React, { Component, Fragment } from 'react'
import { Button } from 'antd'
import MultiSelectModal from './multiSelectModal'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { fetchResidence } from '../../actions'
import CONSTANTS from '../../constants'
const {
  RESIDENCE_TYPE_ZONE,
  RESIDENCE_TYPE_BUILDING,
  RESIDENCE_TYPE_FLOOR
} = CONSTANTS

// type: 1: 区域， 2: 楼栋, 3: 楼层
const IdStateName = {
  1: 'zoneIds',
  2: 'buildingIds',
  3: 'floorIds'
}
const ShowModalStateName = {
  1: 'showZoneSelect',
  2: 'showBuildingSelect',
  3: 'showFloorSelect'
}
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
  getBuildingOptions = () => {
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
    // 先将没选择的zone的selected清空
    zoneDataSource.forEach(z => {
      if (!zoneIds.some(zoneId => zoneId === z.id)) {
        z.selected = false
      }
    })
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
            const selected = buildingIds.some(b => b === building.id)
            // 如果该楼栋在所选择的buildingIds内,
            if (selected) {
              buildingNames += building.name || ''
              const floors = building.children
              floors.forEach(f => {
                const floorItem = { id: f.id, name: f.name, selected: true }
                if (floorIds !== 'all') {
                  const isFloorSelected = floorIds.some(
                    selectedFloorId => selectedFloorId === f.id
                  )
                  // 如果楼层在所选择的floorIds内，添加到名字中
                  if (isFloorSelected) {
                    floorNames += f.name || ''
                  } else {
                    floorItem.selected = false
                  }
                }
                floorDataSource.push(floorItem)
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

  setItems = (dataSource, type) => {
    const data = JSON.parse(JSON.stringify(dataSource))
    const selectedIds = data.filter(r => r.selected === true).map(r => r.id)
    const nextState = {}
    // 判断是否为全选
    const isAllSelected =
      data.filter(d => d.selected === true).length === data.length
    const nextIds = isAllSelected ? 'all' : selectedIds
    nextState[ShowModalStateName[type]] = false
    // 判断当前选择对其它的影响, 这里不用更改弹窗中的表单项，只需要改对应id数组
    // 首先更新所有的id数组，然后从区域开始逐级更新下级的id
    let { zoneIds, buildingIds, floorIds } = this.state
    if (type === RESIDENCE_TYPE_ZONE) {
      zoneIds = nextIds
    } else if (type === RESIDENCE_TYPE_BUILDING) {
      buildingIds = nextIds
    } else {
      floorIds = nextIds
      // 此时只要改这个数组就可以了
      nextState.floorIds = floorIds
      return this.setState(nextState)
    }
    const { residence } = this.props
    if (isAllSelected) {
      nextState[IdStateName[type]] = 'all'
      return this.setState(nextState)
    } else {
      const zones =
        zoneIds === 'all'
          ? residence
          : residence.filter(r => zoneIds.some(z => z === r.id))
      const buildingIdsAvailable = [],
        floorIdsAvailable = []
      zones.forEach(zone => {
        const buildings = zone && zone.children
        buildings.forEach(building => {
          buildingIdsAvailable.push(building.id)
          const buildingAlreadyExistInState = buildingIds.some(
            bId => bId === building.id
          )
          if (buildingAlreadyExistInState) {
            // 得到可选的floor的id数组
            const floors = building.children
          }
        })
      })

      // 删除掉没有在当前区域的building的id. 先搜集所有被选的区域的楼栋的id
      const allBuildingIdsOfSelectedZone = []
      selectedIds.forEach(selectedZoneId => {
        const buildingIdsOfTheZone = residence
          .find(r => r.id === selectedZoneId)
          .children.map(building => building.id)
        allBuildingIdsOfSelectedZone.concat(buildingIdsOfTheZone)
      })
      // 清理失效的building id
      for (let l = buildingIds.length, i = l - 1; i > 0; i--) {
        const buildingId = buildingIds[i]
        const stillInSelectedZone = allBuildingIdsOfSelectedZone.some(
          b => b === buildingId
        )
        if (!stillInSelectedZone) {
          buildingIds.splice(i, 1)
        }
      }
    }
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
            width={500}
            forbidEmpty={true}
            suportAllChoose
            closeModal={e => this.closeModal(e, 'showZoneSelect')}
            confirm={data => this.setItems(data, RESIDENCE_TYPE_ZONE)}
            show={showZoneSelect}
            dataSource={zone.dataSource}
            columns={this.getColumns('区域')}
          />
        ) : null}
        {showBuildingSelect ? (
          <MultiSelectModal
            width={500}
            forbidEmpty={true}
            suportAllChoose
            closeModal={e => this.closeModal(e, 'showBuildingSelect')}
            confirm={data => this.setItems(data, RESIDENCE_TYPE_BUILDING)}
            show={showBuildingSelect}
            dataSource={building.dataSource}
            columns={this.getColumns('楼栋')}
          />
        ) : null}
        {showFloorSelect ? (
          <MultiSelectModal
            width={500}
            forbidEmpty={true}
            suportAllChoose
            closeModal={e => this.closeModal(e, 'showFloorSelect')}
            confirm={data => this.setItems(data, RESIDENCE_TYPE_FLOOR)}
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
