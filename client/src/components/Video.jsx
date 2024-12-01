import React from 'react'
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import PropTypes from "prop-types";
const Video = ({title, index,isChecked}) => {
  return (
    <div className='flex p-4 gap-x-4 items-center cursor-pointer hover:bg-gray-100'>
      <div className=''>
        <input type='checkbox' style={{ width: '20px', height: '20px' }} className='cursor-pointer' disabled checked={isChecked} />
      </div>
      <div className='flex flex-col gap-y-2'>
        <p className='text-xl'>{index}. {title}</p>
        <div className='flex gap-x-2 text-gray-500'>
            <OndemandVideoIcon/>
            <p>1 mins</p>
        </div>
      </div>
    </div>
  )
}
Video.propTypes = {
  title: PropTypes.string,
  index: PropTypes.number,
  isChecked: PropTypes.bool,
};
export default Video
