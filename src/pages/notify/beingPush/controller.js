import {
  typeController,
  pageController,
  statusController,
  methodController,
  schoolIdController,
  combineControllers
} from '../../../public/dispatcher'
import store from '../../../index'
import { fetchBeingPushList } from '../../../actions/index'
import CONSTANTS from '../../../constants/index'

const { PAGINATION: SIZE } = CONSTANTS
export const beingsListPropsController = (state, props, event) => {
  return combineControllers([
    typeController,
    pageController,
    statusController,
    methodController,
    schoolIdController
  ])(state, props, event)
}
/**
 * 刷新消息推送列表
 */
export const rePushList = () => {
  const { notifyModule } = store.getState()
  const { beings } = notifyModule
  const { page, type, status, schoolId, method } = beings
  const body = {
    page: page,
    size: SIZE
  }
  if (schoolId !== 'all') {
    body.schoolId = +schoolId
  }
  if (type !== 'all') {
    body.type = +type
  }
  if (status !== 'all') {
    body.status = +status
  }
  if (method !== 'all') {
    body.env = +method
  }
  store.dispatch(fetchBeingPushList(body))
}
