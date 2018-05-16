import BASIC from './basic'
import SCHOOL from './school'
import DEVICE from './device'
import EMPLOYEE from './employee'
import FUND from '../pages/fund/constants.js'
import GIFT from './gift'
import NOTIFY from './notify'
import ORDER from './order'
import STAT from './stat'
import TASK from './task'
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
