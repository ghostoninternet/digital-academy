/* eslint-disable react/prop-types */
function SelectDropdown({
  options,
  setSelectedOptions,
}) {
  return (
      <select onChange={(e) => setSelectedOptions(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ">
        <option value={null} defaultValue={null}>Choose a course</option>
        {
          options.map((option, index) => (
            <option key={index} value={option.value}>{option.label}</option>
          ))
        }
      </select>
  )
}

export default SelectDropdown