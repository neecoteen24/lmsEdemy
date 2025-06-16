import React from 'react'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <footer className="flex md:flex-row flex-col-reverse items-center justify-between w-full px-8 border-t py-4 gap-4">
      
      {/* Left side: Logo + Copyright */}
      <div className='flex flex-col md:flex-row items-center gap-4'>
        <img className='w-20' src={assets.logo} alt='logo' />
        <div className='h-7 w-px bg-gray-500/60 hidden md:block'></div>
        <p className='text-xs md:text-sm text-gray-500 text-center md:text-left'>
          Copyright 2024 Anurag. All Rights Reserved
        </p>
      </div>

      {/* Right side: Social Icons */}
      <div className='flex items-center gap-4'>
        <a href='#'>
          <img src={assets.facebook_icon} alt='Facebook' className='w-5 h-5'/>
        </a>
        <a href='#'>
          <img src={assets.twitter_icon} alt='Twitter' className='w-5 h-5'/>
        </a>
        <a href='#'>
          <img src={assets.instagram_icon} alt='Instagram' className='w-5 h-5'/>
        </a>
      </div>

    </footer>
  )
}

export default Footer
