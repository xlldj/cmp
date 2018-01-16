import AjaxHandler from '../pages/ajax';
import { buildAuthenData } from '../pages/util/authenDataHandle';
import { getStore, setStore } from '../pages/util/storage';

export const SET_USERINFO = 'SET_USERINFO';
export const setUserInfo = value => {
  return {
    type: SET_USERINFO,
    value
  };
};

export const SET_AUTHENDATA = 'SET_AUTHENDATA';
export const setAuthenData = value => {
  return {
    type: SET_AUTHENDATA,
    value
  };
};

// fetch privilege/list
export const fetchPrivileges = () => {
  return dispatch => {
    let resource = '/privilege/list';
    const body = null;
    const cb = json => {
      let fullPrivileges = json.data.privileges;
      // set full privileges data
      let full = buildAuthenData(fullPrivileges);
      let data = {
        full: full,
        originalPrivileges: fullPrivileges,
        authenSet: true
      };
      // set data into store
      dispatch({
        type: 'SET_AUTHENDATA',
        value: data
      });
      // store info into sessionStorage so it will remain when refresh
      // sessionStorage/authenInfo should always exist here, because it's set when login
      let authenInfo = JSON.parse(getStore('authenInfo'));
      if (authenInfo) {
        let auth = Object.assign({}, authenInfo, { full: full });
        console.log(auth);
        setStore('authenInfo', JSON.stringify(auth));
      }
    };
    return AjaxHandler.ajax(resource, body, cb);
  };
};

export const SET_ROLE_LIST = 'SET_ROLE_LIST';
export const setRoleList = value => {
  return {
    type: SET_ROLE_LIST,
    value
  };
};

export const SET_SCHOOL_LIST = 'SET_SCHOOL_LIST';
export const setSchoolList = value => {
  return {
    type: SET_SCHOOL_LIST,
    value
  };
};

export const CHANGE_SCHOOL = 'CHANGE_SCHOOL';
export const changeSchool = (subModule, keyValuePair) => {
  return {
    type: CHANGE_SCHOOL,
    subModule,
    keyValuePair
  };
};

export const CHANGE_DEVICE = 'CHANGE_DEVICE';
export const changeDevice = (subModule, keyValuePair) => {
  return {
    type: CHANGE_DEVICE,
    subModule,
    keyValuePair
  };
};

export const CHANGE_ORDER = 'CHANGE_ORDER';
export const changeOrder = (subModule, keyValuePair) => {
  return {
    type: CHANGE_ORDER,
    subModule,
    keyValuePair
  };
};

export const CHANGE_FUND = 'CHANGE_FUND';
export const changeFund = (subModule, keyValuePair) => {
  return {
    type: CHANGE_FUND,
    subModule,
    keyValuePair
  };
};

export const CHANGE_GIFT = 'CHANGE_GIFT';
export const changeGift = (subModule, keyValuePair) => {
  return {
    type: CHANGE_GIFT,
    subModule,
    keyValuePair
  };
};

export const CHANGE_LOST = 'CHANGE_LOST';
export const changeLost = (subModule, keyValuePair) => {
  return {
    type: CHANGE_LOST,
    subModule,
    keyValuePair
  };
};

export const CHANGE_USER = 'CHANGE_USER';
export const changeUser = (subModule, keyValuePair) => {
  return {
    type: CHANGE_USER,
    subModule,
    keyValuePair
  };
};

export const CHANGE_TASK = 'CHANGE_TASK';
export const changeTask = (subModule, keyValuePair) => {
  return {
    type: CHANGE_TASK,
    subModule,
    keyValuePair
  };
};

export const CHANGE_EMPLOYEE = 'CHANGE_EMPLOYEE';
export const changeEmployee = (subModule, keyValuePair) => {
  return {
    type: CHANGE_EMPLOYEE,
    subModule,
    keyValuePair
  };
};

export const CHANGE_NOTIFY = 'CHANGE_NOTIFY';
export const changeNotify = (subModule, keyValuePair) => {
  return {
    type: CHANGE_NOTIFY,
    subModule,
    keyValuePair
  };
};

export const CHANGE_VERSION = 'CHANGE_VERSION';
export const changeVersion = (subModule, keyValuePair) => {
  return {
    type: CHANGE_VERSION,
    subModule,
    keyValuePair
  };
};

export const CHANGE_STAT = 'CHANGE_STAT';
export const changeStat = (subModule, keyValuePair) => {
  return {
    type: CHANGE_STAT,
    subModule,
    keyValuePair
  };
};
