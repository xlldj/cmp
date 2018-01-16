import React from 'react';
import { Table, Button, Slider, Popconfirm, Modal } from 'antd';

import RangeSelect from '../../component/rangeSelect';
import AjaxHandler from '../../ajax';
import CONSTANTS from '../../component/constants';
import SchoolSelector from '../../component/schoolSelector';
import CheckSelect from '../../component/checkSelect';
import { checkObject } from '../../util/checkSame';
import Noti from '../../noti';
import notworking from '../../assets/notworking.jpg';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { changeTask, setUserInfo } from '../../../actions';
const subModule = 'report';
const {
  REPORT_CATE_SUM,
  REPORT_CATE_COMPLAINT,
  REPORT_CATE_ASSESS,
  REPORT_ASSESS_TYPE,
  ASSESS_SCHOOL,
  ASSESS_CUSTOM,
  ASSESS_REPAIRMAN
} = CONSTANTS;
const SIZE = CONSTANTS.PAGINATION;

const TIMERANGESELECTS = {
  1: '今日',
  2: '近3天',
  3: '近7天',
  5: '近30天'
};
const TIMELABEL = {
  0: '等待时间',
  1: '等待时间',
  2: '完结时间'
};

/*------后端接受的all为true/false,必传，post之前将0，1转为true/false---------*/
/*------后端接受的pending为int，不传为所有，我用0表示不传---------------------*/
/*------rule表示顺序或倒序，1为倒序，默认值----------------------------------*/
/*------sourcetype不传表示所有，我用0代替，1为体现，2为维修-------------------*/

class TaskList extends React.Component {
  static propTypes = {
    report: PropTypes.object.isRequired,
    forbiddenStatus: PropTypes.object.isRequired
  };
  constructor(props) {
    super(props);
    let dataSource = [];
    this.state = {
      dataSource,
      loading: false,
      total: 0,
      startTime: '',
      endTime: '',
      note: '',
      noteError: false,
      tagExistError: false,
      searchingText: '',
      showBuildTag: false
    };
    this.sumColumns = [
      {
        title: '客服工作情况',
        children: [
          {
            title: '名字',
            dataIndex: 'name',
            width: '10%'
          },
          {
            title: '学校',
            dataIndex: 'schoolName',
            width: '17%'
          },
          {
            title: '当前状态',
            dataIndex: 'status'
          },
          {
            title: '待处理工单',
            dataIndex: 'pending',
            width: '10%'
          },
          {
            title: '处理中工单',
            dataIndex: 'processing',
            width: '10%'
          },
          {
            title: '已完结工单',
            dataIndex: 'finished',
            width: '10%'
          },
          {
            title: '平均响应时长',
            dataIndex: 'responseTime',
            width: '10%'
          },
          {
            title: '发送客服消息数量',
            dataIndex: 'send',
            width: '13%'
          },
          {
            title: '创建工单数量',
            dataIndex: 'create',
            width: '10%'
          }
        ]
      }
    ];
    this.assessSchoolColumns = [
      {
        title: <span className="leftHeader">学校考核</span>,
        children: [
          {
            title: '学校',
            dataIndex: 'schoolName',
            width: '8%'
          }
        ]
      },
      {
        title: '客服',
        children: [
          {
            title: '已完成工单量',
            dataIndex: 'csWorkAssess',
            width: '8%',
            render: (text, record) => record.csWorkAssess.finished,
            sorter: (a, b) => a.csWorkAssess.finished - b.csWorkAssess.finished
          },
          {
            title: '创建工单量',
            dataIndex: 'csWorkAssess',
            width: '8%',
            render: (text, record) => record.csWorkAssess.create
          },
          {
            title: '平均响应时长',
            dataIndex: 'csWorkAssess',
            width: '8%',
            render: (text, record) => record.csWorkAssess.responseTime,
            sorter: (a, b) =>
              a.csWorkAssess.responseTime - b.csWorkAssess.responseTime
          },
          {
            title: '指派成功率',
            dataIndex: 'csWorkAssess',
            width: '8%',
            render: (text, record) => record.csWorkAssess.success + '%'
          }
        ]
      },
      {
        title: '维修员',
        children: [
          {
            title: '已完成工单量',
            dataIndex: 'repairmanWorkAssess',
            width: '8%',
            render: (text, record) => record.repairmanWorkAssess.finished,
            sorter: (a, b) =>
              a.repairmanWorkAssess.finished - b.repairmanWorkAssess.finished
          },
          {
            title: '一天内完成率',
            dataIndex: 'repairmanWorkAssess',
            width: '8%',
            render: (text, record) => record.repairmanWorkAssess.finishedRate,
            sorter: (a, b) =>
              a.repairmanWorkAssess.finishedRate -
              b.repairmanWorkAssess.finishedRate
          },
          {
            title: '平均响应时长',
            dataIndex: 'repairmanWorkAssess',
            width: '8%',
            render: (text, record) => record.repairmanWorkAssess.responseTime,
            sorter: (a, b) =>
              a.repairmanWorkAssess.responseTime -
              b.repairmanWorkAssess.responseTime
          },
          {
            title: '平均维修时长',
            dataIndex: 'repairmanWorkAssess',
            width: '8%',
            render: (text, record) => record.repairmanWorkAssess.repairTime,
            sorter: (a, b) =>
              a.repairmanWorkAssess.repairTime -
              b.repairmanWorkAssess.repairTime
          },
          {
            title: '二次维修次数',
            dataIndex: 'repairmanWorkAssess',
            width: '8%',
            render: (text, record) => record.repairmanWorkAssess.second,
            sorter: (a, b) =>
              a.repairmanWorkAssess.second - b.repairmanWorkAssess.second
          },
          {
            title: '用户评价',
            dataIndex: 'repairmanWorkAssess',
            width: '8%',
            render: (text, record) => record.repairmanWorkAssess.rating,
            sorter: (a, b) =>
              a.repairmanWorkAssess.rating - b.repairmanWorkAssess.rating
          }
        ]
      }
    ];
    this.assessCustomColumns = [
      {
        title: <span className="leftHeader">客服考核</span>,
        children: [
          {
            title: '姓名',
            dataIndex: 'name',
            width: '8%'
          },
          {
            title: '学校',
            dataIndex: 'csWorkAssess',
            width: '10%',
            render: (text, record) => record.schools.join('、')
          },
          {
            title: '已完成工单量',
            dataIndex: 'csWorkAssess',
            width: '8%',
            render: (text, record) => record.csWorkAssess.finished,
            sorter: (a, b) => a.csWorkAssess.finished - b.csWorkAssess.finished
          },
          {
            title: '平均响应时长',
            dataIndex: 'csWorkAssess',
            width: '8%',
            render: (text, record) => record.csWorkAssess.responseTime,
            sorter: (a, b) =>
              a.csWorkAssess.responseTime - b.csWorkAssess.responseTime
          },
          {
            title: '创建工单量',
            dataIndex: 'csWorkAssess',
            width: '8%',
            render: (text, record) => record.csWorkAssess.create
          },
          {
            title: '指派成功率',
            dataIndex: 'csWorkAssess',
            width: '8%',
            render: (text, record) => record.csWorkAssess.success + '%'
          },
          {
            title: '发送客服消息数量',
            dataIndex: 'csWorkAssess',
            width: '8%',
            render: (text, record) => record.csWorkAssess.send
          }
        ]
      }
    ];
    this.assessRepairmanColumns = [
      {
        title: <span className="leftHeader">维修员考核</span>,
        children: [
          {
            title: '姓名',
            dataIndex: 'name',
            width: '8%'
          },
          {
            title: '学校',
            dataIndex: 'schools',
            width: '10%',
            render: (text, record) => record.schools.join('、')
          },
          {
            title: '已完成工单量',
            dataIndex: 'finished',
            width: '8%',
            render: (text, record) => record.repairmanWorkAssess.finished,
            sorter: (a, b) =>
              a.repairmanWorkAssess.finished - b.repairmanWorkAssess.finished
          },
          {
            title: '一天内完成率',
            dataIndex: 'finishedRate',
            width: '8%',
            render: (text, record) => record.repairmanWorkAssess.finishedRate,
            sorter: (a, b) =>
              a.repairmanWorkAssess.finishedRate -
              b.repairmanWorkAssess.finishedRate
          },
          {
            title: '平均响应时长',
            dataIndex: 'responseTime',
            width: '8%',
            render: (text, record) => record.repairmanWorkAssess.responseTime,
            sorter: (a, b) =>
              a.repairmanWorkAssess.responseTime -
              b.repairmanWorkAssess.responseTime
          },
          {
            title: '平均维修时长',
            dataIndex: 'repairTime',
            width: '8%',
            render: (text, record) => record.repairmanWorkAssess.repairTime,
            sorter: (a, b) =>
              a.repairmanWorkAssess.repairTime -
              b.repairmanWorkAssess.repairTime
          },
          {
            title: '二次维修次数',
            dataIndex: 'second',
            width: '8%',
            render: (text, record) => record.repairmanWorkAssess.second,
            sorter: (a, b) =>
              a.repairmanWorkAssess.second - b.repairmanWorkAssess.second
          },
          {
            title: '用户评价(5分)',
            dataIndex: 'rating',
            width: '8%',
            render: (text, record) => record.repairmanWorkAssess.rating,
            sorter: (a, b) =>
              a.repairmanWorkAssess.rating - b.repairmanWorkAssess.rating
          }
        ]
      }
    ];
  }

  // fetch task/list
  fetchReports = (resource, body, cate) => {
    const cb = json => {
      let nextState = {
        loading: false
      };
      let data = {};
      if (cate === REPORT_CATE_SUM) {
        data = json.data.workReports;
      } else if (cate === REPORT_CATE_ASSESS) {
        data = json.data.workAssesses;
      } else if (cate === REPORT_CATE_COMPLAINT) {
        data = json.data.tags;
      }
      nextState.dataSource = data;
      this.setState(nextState);
    };
    this.setState({
      loading: true
    });
    AjaxHandler.ajax(resource, body, cb, null, {
      clearLoading: true,
      thisObj: this
    });
  };
  componentDidMount() {
    this.props.hide(false);
    let {
      mainCate,
      schoolId,
      panel_rangeIndex,
      panel_startTime,
      panel_endTime,
      panel_page,
      assess_dim
    } = this.props[subModule];

    let page = panel_page[mainCate];
    let startTime = panel_startTime[mainCate],
      endTime = panel_endTime[mainCate],
      day = panel_rangeIndex[mainCate];
    const body = {
      page: page,
      size: SIZE
    };
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10);
    }
    if (day !== 0) {
      // 0 means selected startTime and endTime
      body.day = day;
    }
    if (startTime && endTime) {
      body.startTime = startTime;
      body.endTime = endTime;
    }

    let resource = '/work/condition/list';
    if (mainCate === REPORT_CATE_ASSESS - 1) {
      resource = '/work/condition/assess/list';
      body.type = assess_dim;
    } else if (mainCate === REPORT_CATE_COMPLAINT - 1) {
      resource = '/complaint/tag/list';
    }

    this.fetchReports(resource, body, mainCate);

    // set startTime and endTime if props has no-empty value
    if (panel_startTime[mainCate] && panel_endTime[mainCate]) {
      this.setState({
        startTime: panel_startTime[mainCate],
        endTime: panel_endTime[mainCate]
      });
    }
  }
  componentWillUnmount() {
    this.props.hide(true);
  }
  componentWillReceiveProps(nextProps) {
    /* distinguish data fetch of 'list' from 'detail' , or else it will cause mutual chaos. */
    try {
      let {
        mainCate,
        schoolId,
        panel_rangeIndex,
        panel_startTime,
        panel_endTime,
        panel_page,
        assess_dim
      } = nextProps[subModule];

      // update state.startTime to props.startTime
      let { startTime, endTime } = this.state,
        nextState = {};
      if (startTime !== panel_startTime[mainCate]) {
        nextState.startTime = panel_startTime[mainCate];
      }
      if (endTime !== panel_endTime[mainCate]) {
        nextState.endTime = panel_endTime[mainCate];
      }
      this.setState(nextState);

      // Check props to determine if need to fetch.
      if (
        !checkObject(this.props[subModule], nextProps[subModule], [
          'mainCate',
          'schoolId',
          'panel_rangeIndex',
          'panel_startTime',
          'panel_endTime',
          'panel_page',
          'assess_dim'
        ])
      ) {
        let page = panel_page[mainCate];
        let day = panel_rangeIndex[mainCate];
        const body = {
          page: page,
          size: SIZE
        };
        if (schoolId !== 'all') {
          body.schoolId = parseInt(schoolId, 10);
        }
        if (day !== 0) {
          body.day = day;
        }
        if (startTime && endTime) {
          body.startTime = startTime;
          body.endTime = endTime;
        }

        let resource = '/work/condition/list';
        if (mainCate === REPORT_CATE_ASSESS - 1) {
          resource = '/work/condition/assess/list';
          body.type = assess_dim;
        } else if (mainCate === REPORT_CATE_COMPLAINT - 1) {
          resource = '/complaint/tag/list';
        }
        this.fetchReports(resource, body, mainCate);
      }

      this.props = nextProps;
    } catch (e) {
      console.log(e);
    }
  }

  changeCate = e => {
    try {
      e.preventDefault();
      let key = parseInt(e.target.getAttribute('data-key'), 10);
      let { mainCate } = this.props[subModule];
      if (mainCate !== key) {
        this.props.changeTask(subModule, { mainCate: key });
      }
    } catch (e) {
      console.log(e);
    }
  };

  changeSchool = v => {
    let { schoolId } = this.props[subModule];
    if (v === schoolId) {
      return;
    }
    this.props.changeTask(subModule, {
      schoolId: v,
      panel_page: [1, 1, 1]
    });
  };

  changeRange = key => {
    let panel_rangeIndex = this.props[subModule]['panel_rangeIndex'].slice();
    let i = this.props[subModule].mainCate;
    if (panel_rangeIndex[i] === key) {
      return;
    }

    let panel_page = this.props[subModule]['panel_page'].slice();
    let startTime = this.props[subModule]['panel_startTime'].slice();
    let endTime = this.props[subModule]['panel_endTime'].slice();

    panel_rangeIndex[i] = parseInt(key, 10);
    panel_page[i] = 1;
    // clear startTime and endTime
    startTime[i] = '';
    endTime[i] = '';
    this.props.changeTask(subModule, {
      panel_rangeIndex: panel_rangeIndex,
      panel_page: panel_page,
      panel_startTime: startTime,
      panel_endTime: endTime
    });
  };

  changeAssessDim = key => {
    let { assess_dim } = this.props[subModule];
    if (assess_dim === key) {
      return;
    }
    this.props.changeTask(subModule, {
      assess_dim: key
    });
  };
  changeStartTime = time => {
    this.setState({
      startTime: time
    });
  };
  changeEndTime = time => {
    this.setState({
      endTime: time
    });
  };
  confirmTimeRange = () => {
    let { startTime, endTime } = this.state;
    if (!startTime || !endTime) {
      return;
    }
    let panel_startTime = JSON.parse(
      JSON.stringify(this.props[subModule].panel_startTime)
    );
    let panel_endTime = JSON.parse(
      JSON.stringify(this.props[subModule].panel_endTime)
    );
    let panel_page = this.props[subModule].panel_page.slice();
    let panel_rangeIndex = this.props[subModule].panel_rangeIndex.slice();
    // let panel_total = JSON.parse(JSON.stringify(this.props[subModule].panel_total))
    let i = this.props[subModule].mainCate;
    panel_startTime[i] = startTime;
    panel_endTime[i] = endTime;
    panel_page[i] = 1;
    panel_rangeIndex[i] = 0;
    this.props.changeTask(subModule, {
      panel_startTime: panel_startTime,
      panel_endTime: panel_endTime,
      panel_page: panel_page,
      panel_rangeIndex: panel_rangeIndex
    });
  };

  changePage = pageObj => {
    let page = pageObj.current;
    let { panel_page, mainCate } = this.props[subModule];
    let former = panel_page[mainCate];
    if (former === page) {
      return;
    }
    let newPage = Array.from(panel_page);
    newPage.splice(mainCate, 1, page);
    this.props.changeTask(subModule, { panel_page: newPage });
  };

  buildTag = () => {
    this.setState({
      showBuildTag: true
    });
  };
  cancelBuildTag = () => {
    this.setState({
      showBuildTag: false,
      note: ''
    });
  };
  buildTagSuccess = () => {
    Noti.hintOk('操作成功', '创建标签成功');
    this.setState({
      showBuildTag: false
    });
    this.updateList();
  };
  updateList = () => {
    this.fetchReports();
  };
  changeNote = e => {
    this.setState({
      note: e.target.value
    });
  };
  checkNote = e => {
    let v = e.target.value;
    if (!v) {
      return this.setState({
        noteError: true,
        note: v
      });
    }
    if (this.state.noteError) {
      this.setState({
        noteError: false,
        note: v
      });
    }
  };
  confirmBuildTag = () => {
    let { tagId, note, posting, checking, originalTag } = this.state;
    let description = note.trim();
    if (!description) {
      return this.setState({
        noteError: true
      });
    }
    if (posting || checking) {
      return;
    }

    if (tagId && tagId === originalTag) {
      this.postTag();
    } else {
      this.checkExist(this.postTag);
    }
  };
  checkExist = callback => {
    let { note, checking } = this.state;
    if (checking) {
      return;
    }
    this.setState({
      checking: true
    });
    let description = note.trim();
    let resource = '/complaint/tag/check';
    const body = {
      description: description
    };
    const cb = json => {
      const nextState = {
        checking: false
      };
      if (json.error) {
        this.hintError();
      } else {
        if (json.data.result) {
          Noti.hintLock('请求出错', '该标签已被添加！');
          this.setState({
            tagExistError: true
          });
        } else {
          if (this.state.tagExistError) {
            nextState.tagExistError = false;
          }
          if (callback) {
            callback();
          }
        }
        this.setState(nextState);
      }
      this.setState(nextState);
    };
    AjaxHandler.ajax(resource, body, cb, null, {
      clearChecking: true,
      thisObj: this
    });
  };
  postTag = e => {
    let { tagId, note, posting } = this.state;
    if (posting) {
      return;
    }
    this.setState({
      posting: true
    });
    let description = note.trim();
    let resource = '/complaint/tag/add';
    const body = {
      description: description
    };
    if (tagId) {
      resource = '/complaint/tag/update';
      body.id = tagId;
    }
    const cb = json => {
      if (json.data.result) {
        // success
        this.setState({
          showBuildTag: false,
          note: ''
        });
        Noti.hintOk('操作成功', '当前标签添加成功');
        // refetch list
        this.fetchReports();
      } else {
        Noti.hintWarning('', json.data.failReason || '操作失败，请稍后重试');
      }
    };
    AjaxHandler.ajax(resource, body, cb, null, {
      clearPosting: true,
      thisObj: this
    });
  };
  changeOnline = e => {
    let resource = '/';
  };
  render() {
    const { isCs, csOnline } = this.props.user;
    let {
      mainCate,
      schoolId,
      panel_rangeIndex,
      panel_page,
      assess_dim
    } = this.props[subModule];
    const { forbiddenStatus } = this.props;
    // console.log(dataSource)
    const {
      loading,
      startTime,
      endTime,
      dataSource,
      total,
      showBuildTag,
      note,
      noteError,
      tagExistError
    } = this.state;

    let page = panel_page[mainCate];
    let max = 0;
    let unused =
      mainCate === REPORT_CATE_COMPLAINT &&
      dataSource.length > 0 &&
      dataSource.forEach(r => {
        if (r.amount > max) {
          max = r.amount;
        }
      });

    const sumTable = mainCate === REPORT_CATE_SUM - 1 && (
      <Table
        bordered
        loading={loading}
        rowKey={record => record.id}
        pagination={{
          pageSize: SIZE
        }}
        // dataSource={panel_dataSource[mainCate]}
        dataSource={dataSource}
        columns={this.sumColumns}
        onChange={this.changePage}
        onRowClick={this.selectRow}
        rowClassName={this.setRowClass}
      />
    );

    const complaintColumns = [
      {
        title: '问题',
        width: '25%',
        dataIndex: 'description'
      },
      {
        title: '次数',
        width: '50%',
        dataIndex: 'amount',
        render: (text, record, index) => {
          return (
            <span key={record.id}>
              <Slider
                key={record.id}
                value={record.amount}
                max={max}
                min={0}
                range={false}
                disabled={true}
              />
              <span key={record.id}>{`${record.amount}%`}</span>
            </span>
          );
        }
      },
      {
        title: <span className="ope">操作</span>,
        dataIndex: 'operation',
        className: 'ope',
        render: (text, record, index) => (
          <div className="editable-row-operations">
            <a href="" onClick={e => this.editTag(e, index)}>
              编辑
            </a>
            <span className="ant-divider" />
            <Popconfirm
              title="确定要删除此标签么?"
              onConfirm={e => {
                this.deleteTag(e, record.id);
              }}
              okText="确认"
              cancelText="取消"
            >
              <a href="">删除</a>
            </Popconfirm>
          </div>
        )
      }
    ];
    const complaintTable = mainCate === REPORT_CATE_COMPLAINT - 1 && (
      <Table
        bordered
        loading={loading}
        rowKey={record => record.id}
        pagination={{
          pageSize: SIZE
        }}
        dataSource={dataSource}
        columns={complaintColumns}
        onChange={this.changePage}
        onRowClick={this.selectRow}
        rowClassName={this.setRowClass}
      />
    );

    const assessSchoolTable = mainCate === REPORT_CATE_ASSESS - 1 &&
      assess_dim === ASSESS_SCHOOL && (
        <Table
          bordered
          loading={loading}
          rowKey={record => record.id}
          pagination={{
            pageSize: SIZE,
            current: page,
            total: total
          }}
          // dataSource={panel_dataSource[mainCate]}
          dataSource={dataSource}
          columns={this.assessSchoolColumns}
          onChange={this.changePage}
          onRowClick={this.selectRow}
          rowClassName={this.setRowClass}
        />
      );

    const assessCustomTable = mainCate === REPORT_CATE_COMPLAINT - 1 &&
      assess_dim === ASSESS_CUSTOM && (
        <Table
          bordered
          loading={loading}
          rowKey={record => record.id}
          pagination={{
            pageSize: SIZE,
            current: page,
            total: total
          }}
          // dataSource={panel_dataSource[mainCate]}
          dataSource={dataSource}
          columns={this.assessCustomColumns}
          onChange={this.changePage}
          onRowClick={this.selectRow}
          rowClassName={this.setRowClass}
        />
      );

    const assessRepairmanTable = mainCate === REPORT_CATE_COMPLAINT - 1 &&
      assess_dim === ASSESS_REPAIRMAN && (
        <Table
          bordered
          loading={loading}
          rowKey={record => record.id}
          pagination={{
            pageSize: SIZE,
            current: page,
            total: total
          }}
          dataSource={dataSource}
          columns={this.assessRepairmanColumns}
          onChange={this.changePage}
          onRowClick={this.selectRow}
          rowClassName={this.setRowClass}
        />
      );

    return (
      <div className="taskPanelWrapper" ref="wrapper">
        {isCs && !csOnline ? (
          <div
            className="loadingMask offlineWrapper"
            onClick={this.changeOnline}
          >
            <div className="offline">
              <img src={notworking} alt="offline" />
              <span>未进入工作状态</span>
              <Button size="small" type="primary" onClick={this.changeOnline}>
                点击上班
              </Button>
            </div>
          </div>
        ) : null}
        <div className="phaseLine">
          <div className="block">
            <div className="navLink" onClick={this.changeCate}>
              <a
                href=""
                className={mainCate === 0 ? 'active' : ''}
                data-key={0}
              >
                工作情况
              </a>
              <a
                href=""
                className={mainCate === 1 ? 'active' : ''}
                data-key={1}
              >
                投诉分析
              </a>
              <a
                href=""
                className={mainCate === 2 ? 'active' : ''}
                data-key={2}
              >
                绩效考核
              </a>
            </div>
            <div className="task-select">
              <SchoolSelector
                className="select-item"
                selectedSchool={schoolId}
                changeSchool={this.changeSchool}
              />
            </div>
          </div>
          {mainCate === REPORT_CATE_COMPLAINT ? (
            <div className="block">
              {forbiddenStatus.BUILD_COMPLAINT_TAG ? null : (
                <Button
                  type="primary"
                  className="rightBtn"
                  onClick={this.buildTag}
                >
                  添加投诉标签
                </Button>
              )}
            </div>
          ) : null}
        </div>

        <div className="task-queryPanel">
          <div className="task-queryLine">
            <div className="block">
              <span>{TIMELABEL[mainCate]}:</span>
              <CheckSelect
                options={TIMERANGESELECTS}
                value={panel_rangeIndex[mainCate]}
                onClick={this.changeRange}
              />
              <RangeSelect
                className="task-rangeSelect"
                startTime={startTime}
                endTime={endTime}
                changeStartTime={this.changeStartTime}
                changeEndTime={this.changeEndTime}
                confirm={this.confirmTimeRange}
              />
            </div>
          </div>

          {mainCate === REPORT_CATE_ASSESS - 1 ? (
            <div className="task-queryLine">
              <div className="block">
                <span>考核维度:</span>
                <CheckSelect
                  options={REPORT_ASSESS_TYPE}
                  value={assess_dim}
                  onClick={this.changeAssessDim}
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="tableList">
          {mainCate === REPORT_CATE_SUM - 1 ? sumTable : null}
          {mainCate === REPORT_CATE_COMPLAINT - 1 ? complaintTable : null}
          {mainCate === REPORT_CATE_ASSESS - 1
            ? assess_dim === ASSESS_SCHOOL
              ? assessSchoolTable
              : assess_dim === ASSESS_CUSTOM
                ? assessCustomTable
                : assessRepairmanTable
            : null}
        </div>

        <Modal
          wrapClassName="modal finish"
          width={350}
          title="添加标签"
          visible={showBuildTag}
          onCancel={this.cancelBuildTag}
          footer={null}
          okText=""
        >
          <div className="info buildTask">
            <ul>
              <li>
                <p>标签:</p>
                <input
                  value={note}
                  className="longInput"
                  onChange={this.changeNote}
                  onBlur={this.checkNote}
                />
                {noteError ? (
                  <span className="checkInvalid">内容不能为空</span>
                ) : null}
                {tagExistError ? (
                  <span className="checkInvalid">此标签已存在！</span>
                ) : null}
              </li>
            </ul>
            <div className="btnArea">
              <Button onClick={this.confirmBuildTag} type="primary">
                确认
              </Button>
              <Button onClick={this.cancelBuildTag}>返回</Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

// export default TaskList

const mapStateToProps = (state, ownProps) => ({
  report: state.changeTask[subModule],
  user: state.setUserInfo,
  forbiddenStatus: state.setAuthenData.forbiddenStatus
});

export default withRouter(
  connect(mapStateToProps, {
    changeTask,
    setUserInfo
  })(TaskList)
);
