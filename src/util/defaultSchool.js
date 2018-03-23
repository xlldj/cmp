import { getLocal } from '../util/storage'
const recentSchools = getLocal('recentSchools')
const getDefaultSchool = () => {
  var selectedSchool = 'all'
  if (recentSchools) {
    let recent = recentSchools.split(',')
    let schoolId = recent[0]
    selectedSchool = schoolId
  }
  return selectedSchool
}

export default getDefaultSchool
