const subModule = 'lostListContainer'
/**
 * 改变LostListContainer组件的schoolId
 * action for LostListContainer
 * @param {Object} props :LostListContainer组件的props
 * @param {string} v     :传入的学校id
 */
export const changeSchool = (props, v) => {
  const { schoolId } = props
  if (schoolId !== v) {
    props.changeLost(subModule, { schoolId: v })
  }
}
/**
 * 改变LostListContainer组件的tab
 * action for LostListContainer
 * @param {Object} props :LostListContainer组件的props
 * @param {string} v     :传入的tab页值
 */
export const changePhase = (props, v) => {
  const { tabIndex } = props
  if (tabIndex !== v) {
    props.changeLost(subModule, { tabIndex: v })
  }
}
