import {
  schoolIdController,
  methodController,
  typeController,
  statusController,
  pageController,
  combineControllers,
  closeDetailController
} from '../../../public/dispatcher'
import store from '../../../index.js'
import { fetchFundCheckInfo } from '../action'

export const fundCheckDetailPropsController = (state, props, event) => {
  return combineControllers([closeDetailController])(state, props, event)
}

export const fundCheckListPropsController = (state, props, event) => {
  return combineControllers([
    schoolIdController,
    methodController,
    typeController,
    statusController,
    pageController
  ])(state, props, event)
}
