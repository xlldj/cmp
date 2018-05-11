import {
  closeDetailController,
  combineControllers
} from '../../../public/dispatcher'
export const propsController = (state, props, event) => {
  return combineControllers([closeDetailController])(state, props, event)
}
