import {
  typeController,
  pageController,
  statusController,
  methodController,
  schoolIdController,
  combineControllers
} from '../../../public/dispatcher'
export const beingsListPropsController = (state, props, event) => {
  return combineControllers([
    typeController,
    pageController,
    statusController,
    methodController,
    schoolIdController
  ])(state, props, event)
}
