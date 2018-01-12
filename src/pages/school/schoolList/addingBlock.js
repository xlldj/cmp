import React from 'react';

import { Button, Popconfirm, Tag } from 'antd';

import AjaxHandler from '../../ajax';
import Noti from '../../noti';
import CONSTANTS from '../../component/constants';
import Format from '../../component/format';
import BasicSelectorWithoutAll from '../../component/basicSelectorWithoutAll';
import { getStore } from '../../util/storage';

const BUILDINGTYPE = CONSTANTS.BUILDINGTYPE;

class AddingBlock extends React.Component {
  constructor(props) {
    super(props);
    // request for edtingBlock or get the data through the props.match.params.id
    // blockInfo may need handle to fit the format
    let blockName = '',
      floorCount = '',
      blockInfo = [],
      showFloor = true,
      id = 0,
      schoolName = '',
      schoolId = 0,
      initialName = '';
    let blockNameError = false,
      floorCountError = false,
      blockError = false,
      type = '0',
      typeError = false,
      blockErrorMessage = '',
      floorErrorMsg = '',
      loading = false;
    this.state = {
      blockName,
      floorCount,
      blockInfo,
      showFloor,
      blockNameError,
      floorCountError,
      blockError,
      type,
      typeError,
      id,
      schoolName,
      schoolId,
      initialName,
      floorErrorMsg,
      loading,
      posting: false,
      checking: false,
      blockErrorMessage
    };
  }
  componentDidMount() {
    this.props.hide(false);
    if (this.props.match.params.id) {
      let id = parseInt(this.props.match.params.id.slice(1), 10);
      this.setState({
        id: id
      });
      this.fetchData(id);
    }
    let schoolId = getStore('schoolIdOfBlock');
    this.setState({
      schoolId: schoolId
    });
    this.fetchSchoolInfo(schoolId);
  }
  componentWillUnmount() {
    this.props.hide(true);
  }

  fetchSchoolInfo = id => {
    let resource = '/school/one';
    const body = {
      id: id
    };
    const cb = json => {
      if (json.error) {
        throw new Error(json.error);
      } else {
        this.setState({
          schoolName: json.data.name
        });
      }
    };
    AjaxHandler.ajax(resource, body, cb);
  };

  fetchData = id => {
    this.setState({
      loading: true
    });
    let resource = '/residence/tree';
    const body = {
      residenceId: id
    };
    const cb = json => {
      let nextState = { loading: false };
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error);
      } else {
        const blockInfo = json.data.residences[0];
        nextState.initialName = json.data.residences[0].residence.name;
        this.handleBlock(blockInfo);
      }
      this.setState(nextState);
    };
    AjaxHandler.ajax(resource, body, cb);
  };

  handleBlock = blockInfo => {
    // const blockInfo = this.props.blockInfo
    const newBlock = [];
    let floors = blockInfo.children;
    if (
      blockInfo.residence.buildingType &&
      blockInfo.residence.buildingType.toString() === '1'
    ) {
      for (let i = 0; i < floors.length; i++) {
        const roomIDs = [];
        for (let j = 0; j < floors[i].children.length; j++) {
          let name = floors[i].children[j].residence.name;
          roomIDs.push({
            name: name,
            fullName: name
          });
        }
        newBlock.push({
          floorID: `${i}floor`,
          showRooms: true,
          start: '', //floors[i].children[0].residence.name,
          stop: '', //floors[i].children[l-1].residence.name,
          roomIDs: roomIDs,
          prefix: '',
          roomHeader: i + 1,
          name: floors[i].residence.name,
          fromServer: true // 编辑时，未批量处理前没有添加前缀操作
        });
      }
    } else {
      floors.forEach((floor, index) => {
        newBlock.push({
          name: floor.residence.name,
          id: floor.residence.id
        });
      });
    }
    this.setState({
      blockName: blockInfo.residence.name,
      floorCount: blockInfo.children.length,
      blockInfo: newBlock,
      type: blockInfo.residence.buildingType.toString()
    });
  };
  reset = () => {
    /*-------------fetch the data again-----------*/
    this.fetchData(this.state.id);
  };
  changeBlockName = e => {
    this.setState({
      blockName: e.target.value.trim()
    });
  };
  checkBlockName = e => {
    let v = e.target.value.trim();
    if (!v) {
      return this.setState({
        blockName: v,
        blockNameError: true,
        blockErrorMessage: '楼栋名称不能为空！'
      });
    }
    let nextState = {
      blockName: v
    };
    if (this.state.blockNameError) {
      nextState.blockNameError = false;
      nextState.blockErrorMessage = '';
    }
    this.setState(nextState);
    if (this.state.id && this.state.initialName === v) {
      return;
    } else {
      this.checkExist(null);
    }
  };
  changeFloorCount = e => {
    let v = parseInt(e.target.value, 10);
    this.setState({
      floorCount: v
    });
  };
  handleFloor = e => {
    let { floorCount, type } = this.state;
    if (!floorCount) {
      return this.setState({
        floorCountError: true,
        floorErrorMsg: '楼层数不能为空！'
      });
    }
    if (!parseInt(type, 10)) {
      return this.setState({
        typeError: true
      });
    }
    //check if the blockInfo is empty , if yes, populate it
    const newBlock = [];
    for (let i = 0; i < floorCount; i++) {
      newBlock.push({
        floorID: `${i}floor`,
        showRooms: true,
        start: '',
        stop: '',
        roomIDs: [],
        roomError: false,
        roomErrorMsg: '',
        roomHeader: i + 1, // 宿舍名的头字母
        name: Format.number2chi(i + 1) + '层',
        nameError: false,
        prefix: '',
        showPrefix: false,
        customRoomName: '',
        showCustomRoom: false
      });
    }
    this.setState({
      blockInfo: newBlock
    });
  };
  toggleFloors = () => {
    this.setState({
      showFloor: !this.state.showFloor
    });
  };
  changeFloorStart = (e, floorID) => {
    let value = parseInt(e.target.value, 10);
    const newBlockInfo = JSON.parse(JSON.stringify(this.state.blockInfo));
    let floorIndex = newBlockInfo.findIndex((item, index) => {
      return item.floorID === floorID;
    });
    newBlockInfo[floorIndex].start = value;
    this.setState({
      blockInfo: newBlockInfo
    });
  };
  checkFloorStart = (e, index) => {
    let blockInfo = JSON.parse(JSON.stringify(this.state.blockInfo));
    if (
      !blockInfo[index].start ||
      blockInfo[index].start > 100 ||
      blockInfo[index].start < 0
    ) {
      blockInfo[index].roomError = true;
      blockInfo[index].roomErrorMsg =
        '宿舍号越界，下限为0，上限为100，请重新输入!';
      return this.setState({
        blockInfo: blockInfo
      });
    }
    if (blockInfo[index].roomError) {
      blockInfo[index].roomError = true;
      this.setState({
        blockInfo: blockInfo
      });
    }
  };
  changeFloorStop = (e, floorID) => {
    let value = parseInt(e.target.value, 10);
    const newBlockInfo = JSON.parse(JSON.stringify(this.state.blockInfo));
    let floorIndex = newBlockInfo.findIndex((item, index) => {
      return item.floorID === floorID;
    });
    newBlockInfo[floorIndex].stop = value;
    this.setState({
      blockInfo: newBlockInfo
    });
  };
  checkFloorStop = (e, index) => {
    let blockInfo = JSON.parse(JSON.stringify(this.state.blockInfo));
    if (
      !blockInfo[index].stop ||
      blockInfo[index].stop > 100 ||
      blockInfo[index].stop < 0 ||
      blockInfo[index].stop < blockInfo[index].start
    ) {
      blockInfo[index].roomError = true;
      blockInfo[index].roomErrorMsg =
        '宿舍号越界，下限为0，上限为100，请重新输入!';
      return this.setState({
        blockInfo: blockInfo
      });
    }
    if (blockInfo[index].roomError) {
      blockInfo[index].roomError = true;
      this.setState({
        blockInfo: blockInfo
      });
    }
  };
  handleRooms = (e, id) => {
    const newBlockInfo = JSON.parse(JSON.stringify(this.state.blockInfo));
    const currFloor = newBlockInfo.find((item, index) => {
      return item.floorID === id;
    });
    let floorIndex = newBlockInfo.findIndex((item, index) => {
      return item.floorID === id;
    });
    let roomHeader = currFloor.roomHeader,
      start = currFloor.start,
      stop = currFloor.stop;
    let prefix = currFloor.prefix;

    if (start <= 0 || start > 100 || stop <= 0 || stop > 100 || start > stop) {
      currFloor.roomError = true;
      currFloor.roomErrorMsg = '宿舍号越界，下限为0，上限为100，请重新输入!';
      return this.setState({
        blockInfo: newBlockInfo
      });
    }
    if (currFloor.roomError) {
      currFloor.roomError = false;
    }
    newBlockInfo[floorIndex].roomIDs.splice(
      0,
      newBlockInfo[floorIndex].roomIDs.length
    );
    for (let i = start; i < stop + 1; i++) {
      let roomNo = i.toString();
      if (i < 10) {
        roomNo = '0' + i;
      }
      let room = {
        name: roomNo,
        fullName: prefix ? prefix + roomHeader + roomNo : roomHeader + roomNo
      };
      newBlockInfo[floorIndex].roomIDs.push(room);
    }
    let nextState = {
      blockInfo: newBlockInfo
    };
    if (this.state.blockError) {
      nextState.blockError = false;
    }
    this.setState(nextState);
  };
  closeRoom = (e, floorID, r) => {
    //delete the room data in data.
    e.preventDefault();
    const newBlockInfo = JSON.parse(JSON.stringify(this.state.blockInfo));
    let floorIndex = newBlockInfo.findIndex((item, index) => {
      return item.floorID === floorID;
    });
    let roomIndex = newBlockInfo[floorIndex].roomIDs.findIndex(
      (item, index) => {
        return item.fullName === r.fullName;
      }
    );
    newBlockInfo[floorIndex].roomIDs.splice(roomIndex, 1);

    this.setState({
      blockInfo: newBlockInfo
    });
  };
  toggleRooms = (e, floorID) => {
    const newBlockInfo = JSON.parse(JSON.stringify(this.state.blockInfo));
    let floorIndex = newBlockInfo.findIndex((item, index) => {
      return item.floorID === floorID;
    });
    newBlockInfo[floorIndex].showRooms = !newBlockInfo[floorIndex].showRooms;
    this.setState({
      blockInfo: newBlockInfo
    });
  };
  handleSubmit = e => {
    /*--------------post the data to api---------------*/
    let { id, type, blockName, floorCount, initialName } = this.state,
      blockInfo = JSON.parse(JSON.stringify(this.state.blockInfo));
    if (type === '0' || !type) {
      return this.setState({
        typeError: true
      });
    }
    if (!blockName) {
      return this.setState({
        blockNameError: true,
        blockErrorMessage: '楼栋名称不能为空！'
      });
    }
    if (!floorCount) {
      return this.setState({
        floorCountError: true,
        floorErrorMsg: '楼层数不能为空！'
      });
    }
    let error = false;
    if (blockInfo.length < 1) {
      return this.setState({
        floorCountError: true,
        floorErrorMsg: '请添加楼层信息！'
      });
    }
    if (type === '1') {
      blockInfo.forEach((r, i) => {
        if (r.roomIDs.length === 0) {
          blockInfo[i].roomError = true;
          blockInfo[i].roomErrorMsg = '宿舍不能为空！';
          error = true;
          this.setState({
            blockInfo: blockInfo
          });
        }
      });
    } else {
      blockInfo.forEach((r, i) => {
        if (!r.name) {
          blockInfo[i].nameError = true;
          error = true;
          this.setState({
            blockInfo: blockInfo
          });
        }
      });
    }
    if (error) {
      return;
    }

    if (id && initialName === blockName) {
      this.postInfo();
    } else {
      this.checkExist(this.postInfo);
    }
  };
  postInfo = () => {
    let url = '/api/residence/save',
      blockInfo = JSON.parse(JSON.stringify(this.state.blockInfo));
    let { type, posting } = this.state;
    if (posting) {
      return;
    }
    this.setState({
      posting: true
    });
    const floorInfo = blockInfo.map((r, i) => {
      if (type === '1') {
        let rooms = r.roomIDs.map((record, index) => ({
          name: record.fullName
        }));
        let result = {
          rooms: rooms,
          name: r.name
        };
        if (r.id) {
          result.id = r.id;
        }
        return result;
      } else {
        let result = {
          name: r.name
        };
        if (r.id) {
          result.id = r.id;
        }
        return result;
      }
    });
    const body = {
      schoolId: this.state.schoolId,
      name: this.state.blockName,
      floors: floorInfo,
      buildingType: parseInt(type, 10)
    };
    if (this.props.match.params.id) {
      body.id = this.state.id;
    }
    const cb = json => {
      this.setState({
        posting: false
      });
      if (json.error) {
        Noti.hintServiceError(json.error.displayMessage);
      } else {
        /*--------redirect --------*/
        if (json.data) {
          Noti.hintSuccess(this.props.history, '/school/list/blockManage');
        }
      }
    };
    AjaxHandler.ajax(url, body, cb);
  };

  checkExist = callback => {
    if (this.state.checking) {
      return;
    }
    this.setState({
      checking: true
    });
    let url = '/residence/check';
    const body = {
      name: this.state.blockName,
      schoolId: this.state.schoolId
    };
    const cb = json => {
      const nextState = {
        checking: false
      };
      if (json.error) {
        Noti.hintServiceError(json.error.displayMessage);
      } else {
        if (json.data.result) {
          Noti.hintOccupied();
          nextState.blockNameError = true;
          nextState.blockErrorMessage = '楼栋名称已被占用';
        } else {
          if (this.state.blockNameError) {
            nextState.blockNameError = false;
            nextState.blockErrorMessage = '';
          }
          if (callback) {
            callback();
          }
        }
      }
      this.setState(nextState);
    };
    AjaxHandler.ajax(url, body, cb);
  };

  checkFloorCount = () => {
    if (!this.state.floorCount) {
      return this.setState({
        floorCountError: true,
        floorErrorMsg: '楼层数不能为空！'
      });
    }
    if (this.state.floorCountError) {
      this.setState({
        floorCountError: false
      });
    }
  };

  cancelSubmit = () => {
    this.props.history.goBack();
  };

  changeType = v => {
    this.setState({
      type: v,
      blockInfo: []
    });
  };

  changeFloorName = (e, index) => {
    let value = e.target.value,
      blockInfo = JSON.parse(JSON.stringify(this.state.blockInfo));
    blockInfo[index].name = value.trim();
    let nextState = {
      blockInfo: blockInfo
    };
    this.setState(nextState);
  };
  checkFloorName = (e, index) => {
    let value = e.target.value,
      blockInfo = JSON.parse(JSON.stringify(this.state.blockInfo));
    if (!value) {
      blockInfo[index].nameError = true;
      return this.setState({
        blockInfo: blockInfo
      });
    }
    if (blockInfo[index].nameError) {
      blockInfo[index].nameError = false;
      this.setState({
        blockInfo: blockInfo
      });
    }
  };
  checkType = v => {
    if (v === '0') {
      return this.setState({
        typeError: true
      });
    }
    this.setState({
      typeError: false
    });
  };
  addCustom = () => {
    let showCustomBtn = this.state.showCustomBtn;
    this.setState({
      showCustomBtn: !showCustomBtn
    });
  };
  changeCustomFloorName = e => {
    this.setState({
      customFloorName: e.target.value
    });
  };
  checkCustomFloorName = e => {
    let v = e.target.value.trim(),
      nextState = {};
    if (!v) {
      nextState.customFloorNameError = true;
      nextState.customFloorNameErrorMsg = '楼层名不能为空';
      return this.setState(nextState);
    }
    if (v.length > 10) {
      nextState.customFloorNameError = true;
      nextState.customFloorNameErrorMsg = '楼层名不能超过十个字';
      return this.setState(nextState);
    }
    if (this.state.customFloorNameError) {
      nextState.customFloorNameError = false;
      nextState.customFloorNameErrorMsg = '';
    }
    this.setState(nextState);
  };
  addCustomFloor = () => {
    const blockInfo = JSON.parse(JSON.stringify(this.state.blockInfo));
    const { customFloorName } = this.state;
    let r = Math.floor(Math.random() * 10000);
    blockInfo.push({
      floorID: `floor${r}`,
      showRooms: true,
      start: '',
      stop: '',
      roomIDs: [],
      roomError: false,
      roomErrorMsg: '',
      roomHeader: '',
      name: customFloorName,
      nameError: false,
      prefix: '',
      showPrefix: false,
      customRoomName: '',
      showCustomRoom: false
    });
    this.setState({
      blockInfo: blockInfo
    });
  };
  confirmCustomFloorName = () => {
    let { customFloorName } = this.state,
      nextState = {};
    if (!customFloorName) {
      nextState.customFloorNameError = true;
      nextState.customFloorNameErrorMsg = '楼层名不能为空';
      return this.setState(nextState);
    }
    if (customFloorName.length > 10) {
      nextState.customFloorNameError = true;
      nextState.customFloorNameErrorMsg = '楼层名不能超过十个字';
      return this.setState(nextState);
    }
    let blockInfo = this.state.blockInfo;
    let exist = blockInfo.some(f => f.name === customFloorName);
    if (exist) {
      nextState.customFloorNameError = true;
      nextState.customFloorNameErrorMsg = '该楼层名已存在，请勿重复添加';
      return this.setState(nextState);
    }
    nextState.showCustomBtn = false;
    this.setState(nextState);
    this.addCustomFloor();
  };
  togglePrefixBtn = (e, id) => {
    let blockInfo = JSON.parse(JSON.stringify(this.state.blockInfo));
    let floor = blockInfo.find(r => r.floorID === id);
    if (floor.showPrefix) {
      floor.showPrefix = false;
    } else {
      floor.showPrefix = true;
    }
    this.setState({
      blockInfo: blockInfo
    });
  };
  changePrefix = (e, id) => {
    let blockInfo = JSON.parse(JSON.stringify(this.state.blockInfo));
    let floor = blockInfo.find(r => r.floorID === id);
    floor.prefix = e.target.value;
    this.setState({
      blockInfo: blockInfo
    });
  };
  confirmPrefix = (e, id) => {
    let blockInfo = JSON.parse(JSON.stringify(this.state.blockInfo));
    let floor = blockInfo.find(r => r.floorID === id);
    let prefix = floor.prefix.trim();
    if (!prefix) {
      return;
    } else {
      floor.prefix = prefix;
      floor.showPrefix = false;
    }
    this.setState({
      blockInfo: blockInfo
    });
    if (floor.roomIDs.length > 0) {
      this.changeRoomPrefix(id);
    }
  };
  changeRoomPrefix = id => {
    let blockInfo = JSON.parse(JSON.stringify(this.state.blockInfo));
    let floor = blockInfo.find(r => r.floorID === id);
    let prefix = floor.prefix,
      roomHeader = floor.roomHeader;
    floor.roomIDs.forEach(r => {
      if (!r.hasOwnProperty('customedRoom') || r.customedRoom === false) {
        r.fullName = prefix + roomHeader + r.name;
      }
    });
    floor.showPrefix = false;
    this.setState({
      blockInfo: blockInfo
    });
  };
  toggleCustomRoomBtn = (e, id) => {
    let blockInfo = JSON.parse(JSON.stringify(this.state.blockInfo));
    let floor = blockInfo.find(r => r.floorID === id);
    if (floor.showCustomRoom) {
      floor.showCustomRoom = false;
    } else {
      floor.showCustomRoom = true;
    }
    this.setState({
      blockInfo: blockInfo
    });
  };
  changeCustomRoomName = (e, id) => {
    let blockInfo = JSON.parse(JSON.stringify(this.state.blockInfo));
    let floor = blockInfo.find(r => r.floorID === id);
    floor.customRoomName = e.target.value;
    this.setState({
      blockInfo: blockInfo
    });
  };
  confirmCustomRoomName = (e, id) => {
    let blockInfo = JSON.parse(JSON.stringify(this.state.blockInfo));
    let floor = blockInfo.find(r => r.floorID === id);
    let customRoomName = floor.customRoomName.trim();
    if (!customRoomName) {
      return;
    } else {
      floor.customRoomName = customRoomName;
      floor.showCustomRoom = false;
    }
    this.setState({
      blockInfo: blockInfo
    });
    this.addCustomRoom(id);
  };
  addCustomRoom = id => {
    let blockInfo = JSON.parse(JSON.stringify(this.state.blockInfo));
    let floor = blockInfo.find(r => r.floorID === id);
    let customRoomName = floor.customRoomName.trim();
    let exist = floor.roomIDs.some(r => r.fullName === customRoomName);
    if (exist) {
      floor.roomError = true;
      floor.roomErrorMsg = '已添加该宿舍，请勿重复添加';
      return this.setState({
        blockInfo: blockInfo
      });
    }
    floor.roomIDs.push({
      name: customRoomName,
      fullName: customRoomName,
      customedRoom: true
    });
    // if confirm and add , the floor.showCustomRoom state wont change
    floor.showCustomRoom = false;
    this.setState({
      blockInfo: blockInfo
    });
  };
  deleteFloor = (e, id) => {
    let blockInfo = JSON.parse(JSON.stringify(this.state.blockInfo));
    // let floor = blockInfo.find((r) => (r.floorID === id))
    let floorIndex = blockInfo.findIndex(r => r.floorID === id);
    blockInfo.splice(floorIndex, 1);
    this.setState({
      blockInfo: blockInfo
    });
  };
  render() {
    const {
      blockInfo,
      type,
      typeError,
      schoolName,
      id,
      floorErrorMsg,
      showFloor,
      loading,
      showCustomBtn,
      customFloorName,
      customFloorNameError,
      customFloorNameErrorMsg,
      posting
    } = this.state;
    let blockItems = null;
    if (type && type === '1') {
      blockItems =
        blockInfo &&
        blockInfo.map((item, index) => {
          const roomIDs = item.roomIDs;
          const roomItems =
            roomIDs &&
            roomIDs.map((r, i) => (
              <Tag
                className="roomNum"
                closable
                key={i}
                onClose={e => this.closeRoom(e, item.floorID, r)}
              >
                {r.fullName}
              </Tag>
            ));
          return (
            <li key={item.floorID} className="itemsWrapper">
              <p>{item.name}:</p>
              <div>
                <div>
                  <span className="inputValid">
                    <input
                      value={item.start}
                      type="number"
                      className="shortInput"
                      step="1"
                      min="1"
                      max="100"
                      placeholder=""
                      id={`floor${index}start`}
                      name={`floor${index}start`}
                      onChange={e => this.changeFloorStart(e, item.floorID)}
                      onBlur={e => {
                        this.checkFloorStart(e, index);
                      }}
                    />
                  </span>
                  <span>
                    开始————结束
                    <input
                      value={item.stop}
                      type="number"
                      className="shortInput addingBlockInput"
                      step="1"
                      min="1"
                      max="100"
                      placeholder=""
                      id={`floor${index}stop`}
                      name={`floor${index}stop`}
                      onChange={e => this.changeFloorStop(e, item.floorID)}
                      onBlur={e => {
                        this.checkFloorStop(e, index);
                      }}
                    />
                    {item.fromServer ? null : (
                      <Button
                        type="primary"
                        onClick={e => {
                          this.togglePrefixBtn(e, item.floorID);
                        }}
                      >
                        添加前缀
                      </Button>
                    )}
                    {item.showPrefix ? (
                      <span>
                        <input
                          value={item.prefix}
                          onChange={e => {
                            this.changePrefix(e, item.floorID);
                          }}
                          placeholder="请输入前缀"
                        />
                        <Button
                          type="primary"
                          onClick={e => {
                            this.confirmPrefix(e, item.floorID);
                          }}
                        >
                          确认
                        </Button>
                      </span>
                    ) : null}
                    <Button
                      type="primary"
                      onClick={e => {
                        this.handleRooms(e, item.floorID);
                      }}
                    >
                      批量处理
                    </Button>
                    <Button
                      type="primary"
                      onClick={e => {
                        this.toggleCustomRoomBtn(e, item.floorID);
                      }}
                    >
                      单独添加宿舍
                    </Button>
                    {item.showCustomRoom ? (
                      <span>
                        <input
                          value={item.customRoomName}
                          onChange={e => {
                            this.changeCustomRoomName(e, item.floorID);
                          }}
                          placeholder="请输入宿舍名称"
                        />
                        <Button
                          type="primary"
                          onClick={e => {
                            this.confirmCustomRoomName(e, item.floorID);
                          }}
                        >
                          确认
                        </Button>
                      </span>
                    ) : null}
                    <Button
                      onClick={e => {
                        this.deleteFloor(e, item.floorID);
                      }}
                    >
                      删除
                    </Button>
                    {item.roomIDs.length !== 0 ? (
                      <span>
                        <Button
                          onClick={e => {
                            this.toggleRooms(e, item.floorID);
                          }}
                        >
                          {item.showRooms ? '收起' : '展开'}
                        </Button>
                      </span>
                    ) : null}
                  </span>
                </div>
                {item.showRooms ? (
                  <div className="roomsWrapper">{roomItems}</div>
                ) : null}
                {item.roomError ? (
                  <div>
                    <span className="checkInvalid">{item.roomErrorMsg}</span>
                  </div>
                ) : null}
              </div>
            </li>
          );
        });
    } else if (type && type === '2') {
      blockItems =
        blockInfo &&
        blockInfo.map((item, index) => {
          return (
            <li key={item.floorID}>
              <p>{item.name}名称:</p>
              <input
                value={item.name}
                onChange={e => {
                  this.changeFloorName(e, index);
                }}
                onBlur={e => {
                  this.checkFloorName(e, index);
                }}
              />
              {item.nameError ? (
                <span className="checkInvalid">楼层名称不能为空！</span>
              ) : null}
            </li>
          );
        });
    }
    const reset = <Button onClick={this.reset}>恢复</Button>;
    const floorSwitch = (
      <Button onClick={this.toggleFloors}>{showFloor ? '收起' : '展开'}</Button>
    );
    const customBtn = (
      <li>
        <p>添加自定义楼层:</p>
        <input
          value={customFloorName}
          onChange={this.changeCustomFloorName}
          onBlur={this.checkCustomFloorName}
          placeholder="请输入楼层名称"
        />
        <Button type="primary" onClick={this.confirmCustomFloorName}>
          确认
        </Button>
        {customFloorNameError ? (
          <span className="checkInvalid">{customFloorNameErrorMsg}</span>
        ) : null}
      </li>
    );
    const addCustom = (
      <li>
        <p />
        <Button type="primary" onClick={this.addCustom}>
          添加自定义楼层
        </Button>
      </li>
    );
    return (
      <div className="infoList addingBlock">
        <ul>
          <li>
            <p>学校名称:</p>
            {schoolName}
          </li>
          <li>
            <p>楼栋类型:</p>
            <BasicSelectorWithoutAll
              staticOpts={BUILDINGTYPE}
              selectedOpt={type}
              invalidTitle="选择类型"
              changeOpt={this.changeType}
              checkOpt={this.checkType}
              width={CONSTANTS.SELECTWIDTH}
              disabled={id ? true : ''}
              className={id ? 'disabled' : ''}
            />
            {typeError ? (
              <span className="checkInvalid">楼栋类型不能为空！</span>
            ) : null}
          </li>
          <li>
            <p>楼栋名称:</p>
            <input
              value={this.state.blockName}
              disabled={id ? true : ''}
              className={id ? 'disabled' : ''}
              placeholder="楼栋名称"
              onChange={this.changeBlockName}
              onBlur={this.checkBlockName}
            />
            {this.state.blockNameError ? (
              <span className="checkInvalid">
                {this.state.blockErrorMessage}
              </span>
            ) : null}
          </li>
          <li>
            <p>楼层数:</p>
            <span className="inputValid">
              <input
                value={this.state.floorCount}
                type="number"
                step="1"
                min="1"
                max="50"
                placeholder=""
                id="floorCount"
                name="floorCount"
                onChange={this.changeFloorCount}
                onBlur={this.checkFloorCount}
              />
            </span>
            <Button type="primary" onClick={this.handleFloor}>
              批量处理
            </Button>
            {id ? reset : null}
            {this.state.blockInfo.length !== 0 ? floorSwitch : null}
            {this.state.floorCountError ? (
              <span className="checkInvalid">{floorErrorMsg}</span>
            ) : null}
            {this.state.blockError ? (
              <span className="checkInvalid">楼栋信息不能为空！</span>
            ) : null}
          </li>
          {showFloor ? blockItems : null}
          {showCustomBtn ? customBtn : null}
          {type === '1' && blockInfo.length > 0 ? addCustom : null}
        </ul>

        <div className="btnArea">
          {posting ? (
            <Button type="primary">确认</Button>
          ) : (
            <Popconfirm
              title="确定要添加么?"
              onConfirm={this.handleSubmit}
              onCancel={this.cancel}
              okText="确认"
              cancelText="取消"
            >
              <Button type="primary">确认</Button>
            </Popconfirm>
          )}
          <Button onClick={this.cancelSubmit}>返回</Button>
        </div>

        {loading ? <div className="innerLoading">加载中...</div> : null}
      </div>
    );
  }
}

export default AddingBlock;
