import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../../components/educator/Navbar'
import SideBar from '../../components/educator/SideBar'
import { assets } from '../../assets/assets'

const Educator = () => {
  return (
    <div className='text-default min-h-screen bg-white'>
    <Navbar />
    <div className='flex'>
      <SideBar />
      <div className='flex-1'>
      {<Outlet/>}
      </div>
    </div>
    </div>
  )
}

export default Educator