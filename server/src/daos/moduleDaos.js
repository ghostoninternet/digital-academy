import Modules from "../models/moduleModel"

const findModuleById = async (moduleId) => {
  return await Modules.findById(moduleId)
  .then(data => data)
  .catch(err => {
    console.log(err)
    throw new CustomError.DatabaseError()
  })
}

export default {
  findModuleById,
  
}