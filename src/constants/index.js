import BASIC from './basic'
import DEVICE from '../pages/device/constants.js'
import SCHOOL from '../pages/school/constants.js'
import EMPLOYEE from './employee'
import FUND from '../pages/fund/constants.js'
import GIFT from './gift'
import NOTIFY from '../pages/notify/contant.js'
import ORDER from '../pages/order/constants.js'
import STAT from '../pages/stat/constants'
import TASK from '../pages/task/constants.js'
import USER from '../pages/user/constants.js'
import VERSION from './version'
import HEATER from './heater'
import DOORFORBID from './doorForbid'
import LOST from '../pages/lost/constants'
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
