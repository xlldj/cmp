import React, { Component, Fragment } from 'react'
import { Button } from 'antd'
import MultiSelectModal from './multiSelectModal'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { fetchResidence } from '../../actions/index'
import CONSTANTS from '../../constants'
const {
  RESIDENCE_TYPE_ZONE,
  RESIDENCE_TYPE_BUILDING,
  RESIDENCE_TYPE_FLOOR
} = CONSTANTS

// type: 1: 区域， 2: 楼栋, 3: 楼层
const IdStateName = {
  1: 'areaIds',
  2: 'buildingIds',
  3: 'floorIds'
}
const ShowModalStateName = {
  1: 'showZoneSelect',
  2: 'showBuildingSelect',
  3: 'showFloorSelect'
}
class CascadedBuildingSelect extends Component {
  constructor(props) {
    super(props)
    this.state = {
      zoneNames: '全部区域',
      showZoneSelect: false,
      showBuildingSelect: false,
      showFloorSelect: false,
      areaIds: props.areaIds || 'all',
      buildingIds: props.buildingIds || 'all',
      floorIds: props.floorIds || 'all'
    }
  }
  componentDidMount() {
    const { residenceSet, schoolId } = this.props
    // schoolId 总是存在的，且为某一个学校的id
    if (!residenceSet) {
      this.props.fetchResidence(schoolId)
    }
  }
  componentWillReceiveProps(nextProps) {
    const { schoolId, residenceSet } = nextProps
    if (!residenceSet) {
      nextProps.fetchResidence(schoolId)
    }
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
    const { areaIds, buildingIds, floorIds } = this.state
    const { residence } = this.props
    // 区域的选项总是全部的条目
    const zoneDataSource =
      residence &&
      residence.map(r => {
        const unselected =
          areaIds !== 'all' && !areaIds.some(zId => zId === r.id)
        return { id: r.id, name: r.name, selected: unselected ? false : true }
      })
    let zoneNames = areaIds === 'all' ? '全部区域' : [],
      buildingNames = buildingIds === 'all' ? '全部楼栋' : [],
      floorNames = floorIds === 'all' ? '全部楼层' : []
    const buildingDataSource = []
    const floorDataSource = []
    const zones =
      areaIds === 'all'
        ? residence
        : residence.filter(r => areaIds.some(zId => zId === r.id))
    zones.forEach(zone => {
      if (areaIds !== 'all') {
        // 如果不是全选，则这里的区域为选中的区域
        zoneNames.push(zone.name || '')
      }
      if (zone && zone.children) {
        const buildings = zone.children
        buildings.forEach(building => {
          // buildingDataSource.push({ id: building.id, name: building.name, selected: true })
          const buildingItem = {
            id: building.id,
            name: building.name,
            selected: true
          }
          // 如果楼栋不是全选，则只要选选中楼栋的楼层就可以了。反之，则将所有可选楼栋的楼层都加到楼层的选项中。
          if (buildingIds !== 'all') {
            const selected = buildingIds.some(b => b === building.id)
            // 如果该楼栋在所选择的buildingIds内,
            if (selected) {
              buildingNames.push(building.name || '')
              const floors = building.children
              floors.forEach(f => {
                const floorItem = { id: f.id, name: f.name, selected: true }
                if (floorIds !== 'all') {
                  const isFloorSelected = floorIds.some(
                    selectedFloorId => selectedFloorId === f.id
                  )
                  // 如果楼层在所选择的floorIds内，添加到名字中
                  if (isFloorSelected) {
                    floorNames.push(f.name || '')
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
          } else {
            const floors = building.children
            floors.forEach(f => {
              const floorItem = { id: f.id, name: f.name, selected: true }
              if (floorIds !== 'all') {
                const isFloorSelected = floorIds.some(
                  selectedFloorId => selectedFloorId === f.id
                )
                // 如果楼层在所选择的floorIds内，添加到名字中
                if (isFloorSelected) {
                  floorNames.push(f.name || '')
                } else {
                  floorItem.selected = false
                }
              }
              floorDataSource.push(floorItem)
            })
          }
          buildingDataSource.push(buildingItem)
        })
      }
    })
    const zoneNameStr = areaIds === 'all' ? '全部区域' : zoneNames.join('/')
    const buildingNameStr =
      buildingIds === 'all' ? '全部楼栋' : buildingNames.join('/')
    const floorNameStr = floorIds === 'all' ? '全部楼层' : floorNames.join('/')
    return {
      zone: { dataSource: zoneDataSource, name: zoneNameStr },
      building: { dataSource: buildingDataSource, name: buildingNameStr },
      floor: {
        dataSource: floorDataSource,
        name: floorNameStr
      }
    }
  }

  setItems = (dataSource, type) => {
    const data = JSON.parse(JSON.stringify(dataSource))
    const selectedIds = data.filter(r => r.selected === true).map(r => r.id)
    const nextState = {}
    // 判断是否为全选
    const isAllSelected = selectedIds.length === data.length
    const nextIds = isAllSelected ? 'all' : selectedIds
    nextState[ShowModalStateName[type]] = false
    // 判断当前选择对其它的影响, 这里不用更改弹窗中的表单项，只需要改对应id数组
    // 首先更新所有的id数组，然后从区域开始逐级更新下级的id
    let { areaIds, buildingIds, floorIds } = this.state
    const idGroups = { areaIds, buildingIds, floorIds }
    if (type === RESIDENCE_TYPE_ZONE) {
      areaIds = nextIds
    } else if (type === RESIDENCE_TYPE_BUILDING) {
      buildingIds = nextIds
    } else {
      floorIds = nextIds
      // 此时只要改这个数组就可以了
      nextState.floorIds = floorIds
      idGroups.floorIds = floorIds
      this.props.confirm(idGroups)
      return this.setState(nextState)
    }
    const { residence } = this.props
    if (isAllSelected) {
      idGroups[IdStateName[type]] = 'all'
      nextState[IdStateName[type]] = 'all'
      this.props.confirm(idGroups)
      return this.setState(nextState)
    } else {
      const zones =
        areaIds === 'all'
          ? residence
          : residence.filter(r => areaIds.some(z => z === r.id))
      const buildingIdsAvailable = [],
        floorIdsAvailable = []
      zones.forEach(zone => {
        const buildings = zone && zone.children
        if (buildings) {
          buildings.forEach(building => {
            buildingIdsAvailable.push(building.id)
            let buildingAlreadyExistInState = true
            if (
              buildingIds !== 'all' &&
              !buildingIds.some(bId => bId === building.id)
            ) {
              buildingAlreadyExistInState = false
            }
            if (buildingAlreadyExistInState) {
              // 得到可选的floor的id数组
              const floors = building.children
              floors.forEach(f => floorIdsAvailable.push(f.id))
            }
          })
        }
      })

      // 如果楼栋不是全选，根据楼栋和楼层的id来删除无效的id
      if (buildingIds !== 'all') {
        for (let l = buildingIds.length, i = l - 1; i >= 0; i--) {
          const id = buildingIds[i]
          const ind = buildingIdsAvailable.findIndex(bId => bId === id)
          if (ind === -1) {
            buildingIds.splice(ind, 1)
          }
        }
      }
      if (buildingIds.length === 0) {
        buildingIds = 'all'
      }

      if (floorIds !== 'all') {
        for (let l = floorIds.length, i = l - 1; i >= 0; i--) {
          const id = floorIds[i]
          const ind = floorIdsAvailable.some(fId => fId === id)
          if (ind === -1) {
            floorIds.splice(i, 1)
          }
        }
      }
      if (floorIds.length === 0) {
        floorIds = 'all'
      }
    }
    nextState.areaIds = areaIds
    nextState.buildingIds = buildingIds
    nextState.floorIds = floorIds
    idGroups.areaIds = areaIds
    idGroups.buildingIds = buildingIds
    idGroups.floorIds = floorIds
    this.setState(nextState)
    this.props.confirm(idGroups)
  }

  render() {
    const { showZoneSelect, showBuildingSelect, showFloorSelect } = this.state
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
          onClick={e => this.showModal(e, 'showBuildingSelect')}
        >
          点击选择
        </Button>
        <span className="customized_select_option">{floor.name}</span>
        <Button
          type="primary"
          onClick={e => this.showModal(e, 'showFloorSelect')}
        >
          点击选择
        </Button>
        {showZoneSelect ? (
          <MultiSelectModal
            width={500}
            forbidEmpty={true}
            reverseChoose={true}
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
            reverseChoose={true}
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
            reverseChoose={true}
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
    residence: state.buildingsSet.residenceOfSchoolId[ownProps.schoolId] || [],
    residenceSet: !!state.buildingsSet.residenceOfSchoolId[ownProps.schoolId]
  }
}

export default withRouter(
  connect(mapStateToProps, {
    fetchResidence
  })(CascadedBuildingSelect)
)
