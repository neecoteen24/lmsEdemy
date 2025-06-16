import React from 'react'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <footer className="bg-gray-900 md:px-36 w-full mt-10">
      <div className="flex flex-col md:flex-row items-start px-8 md:px-0 justify-center gap-10 md:gap-32 py-10 border-b border-white/30">
        {/* Logo and Description */}
        <div className="flex flex-col md:items-start items-center w-full max-w-xs">
          <img src={assets.logo_dark} alt="logo" className="w-32 mb-4" />
          <p className="mt-2 text-center md:text-left text-sm text-white/80">
            Content for the first column. Describe your company or add a slogan here.
          </p>
        </div>

        {/* Company Links */}
        <div>
          <h2 className="text-white text-lg font-semibold mb-4">Company</h2>
          <ul className="space-y-2">
            <li>
              <a href="#" className="text-white/80 hover:text-white transition">Home</a>
            </li>
            <li>
              <a href="#" className="text-white/80 hover:text-white transition">About us</a>
            </li>
            <li>
              <a href="#" className="text-white/80 hover:text-white transition">Contact us</a>
            </li>
            <li>
              <a href="#" className="text-white/80 hover:text-white transition">Privacy Policy</a>
            </li>
          </ul>
        </div>

        {/* Socials or More (Optional) */}
        <div>
  
  <p className="text-white/90 mb-2 font-medium">Subscribe to our newsletter</p>
  <form className="flex flex-col sm:flex-row items-center gap-2">
    <input
      type="email"
      placeholder="Enter your email"
      className="px-3 py-2 rounded-md bg-gray-800 text-white placeholder-white/60 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition w-full sm:w-auto"
    />
    <button
      type="submit"
      className="px-5 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
    >
      Subscribe
    </button>
  </form>
</div>
      </div>
      <p className="py-4 text-center text-xs md:text-sm text-white/60">
        © 2025 Anurag. All Rights Reserved.
      </p>
    </footer>
  )
}

export default Footer
