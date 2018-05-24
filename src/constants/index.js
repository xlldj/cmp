import BASIC from './basic'
import SCHOOL from './school'
import DEVICE from './device'
import EMPLOYEE from './employee'
import FUND from '../pages/fund/constants.js'
import GIFT from './gift'
import LOST from './lost'
import NOTIFY from '../pages/notify/contant.js'
import ORDER from '../pages/order/constants.js'
import STAT from './stat'
import TASK from './task'
import USER from '../pages/user/constants.js'
import VERSION from './version'
import HEATER from './heater'
import DOORFORBID from './doorForbid'

const CONSTANTS = {
  ...BASIC,
  ...SCHOOL,
  ...HEATER,
  ...DEVICE,
  ...EMPLOYEE,
  ...FUND,
  ...GIFT,
  ...LOST,
  ...NOTIFY,
  ...ORDER,
  ...STAT,
  ...TASK,
  ...USER,
  ...VERSION,
  ...DOORFORBID
}

export default CONSTANTS
