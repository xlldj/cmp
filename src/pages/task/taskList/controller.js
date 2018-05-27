import {
  schoolIdController,
  closeDetailController,
  tabIndexController,
  syncTimeController,
  dayController,
  typeController,
  selectKeyController,
  pageController,
  combineControllers
} from '../../../public/dispatcher'

export const taskDetailPropsController = (state, props, event) => {
  return combineControllers([closeDetailController])(state, props, event)
}

export const taskListContainerPropsController = (state, props, event) => {
  return combineControllers([
    schoolIdController,
    closeDetailController,
    tabIndexController
  ])(state, props, event)
}
export const taskListQueryPropsController = (state, props, event) => {
  return combineControllers([
    dayController,
    typeController,
    pageController,
    selectKeyController,
    syncTimeController,
    tabIndexController
  ])(state, props, event)
}
