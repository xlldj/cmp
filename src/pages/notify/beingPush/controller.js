import {
  typeController,
  pageController,
  statusController,
  methodController,
  combineControllers
} from '../../../public/dispatcher'
export const beingsListPropsController = (state, props, event) => {
  return combineControllers([
    typeController,
    pageController,
    statusController,
    methodController
  ])(state, props, event)
}
