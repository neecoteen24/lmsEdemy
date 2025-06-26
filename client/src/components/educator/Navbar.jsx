import React from 'react'
import { dummyEducatorData, assets } from '../../assets/assets'
import { UserButton, useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  const EducatorData = dummyEducatorData
  const {user} = useUser()



  return (
    <div className='flex items-center justify-between px-4 md:px-8 border-b border-gray-500 py-3'>
      <Link to= '/'>
      <img src={assets.logo} alt='Logo' className='w-28 lg:w-32' />
      </Link>

    <div className='flex items-center gap-3 text-gray-500'>
  <p className='whitespace-nowrap'>Hi! {user ? user.fullName : 'Developer'}</p>
  {user ? (
    <UserButton />
  ) : (
    <img className='w-8 h-8 rounded-full object-cover' src={assets.profile_img} alt='Profile' />
  )}
</div>


    </div>
  )
}

export default Navbar