const isSchoolFsk = (schools, schoolId) => {
  const fox_index = schools.findIndex(s => s.id === parseInt(schoolId, 10))
  if (fox_index !== -1) {
    const school = schools[fox_index]
    if (school.name === '富士康' || school.name === '富士康工厂') {
      return true
    }
  }
  return false
}
export default isSchoolFsk
