import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import SearchBar from '../../components/student/SearchBar'
import CourseCard from '../../components/student/CourseCard'
import { assets } from '../../assets/assets'
import Footer from '../../components/student/Footer'

const CourseList = () => {
  const { navigate, allCourses } = useContext(AppContext)
  const [search, setSearch] = useState('')
  const [filteredCourse, setFilteredCourse] = useState([])

  useEffect(() => {
    if (allCourses?.length > 0) {
      const tempCourses = allCourses.slice()
      setFilteredCourse(
        search
          ? tempCourses.filter(item =>
              item.courseTitle.toLowerCase().includes(search.toLowerCase())
            )
          : tempCourses
      )
    }
  }, [allCourses, search])

  const handleSearch = (searchTerm) => {
    setSearch(searchTerm)
  }

  return (
    <>
    <div className="relative md:px-36 px-4 pt-20 text-left min-h-screen bg-white">
      {/* Header and Breadcrumb */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Course List</h1>
        <p className="text-gray-500 text-sm">
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => navigate('/')}
          >
            Home
          </span>
          <span className="mx-2 text-gray-400">/</span>
          <span>Course List</span>
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Search Tag */}
      {search && (
        <div className="flex items-center gap-2 mb-4 bg-gray-100 px-3 py-1 rounded w-fit">
          <p className="text-gray-700">{search}</p>
          <img
            src={assets.cross_icon}
            alt="Clear search"
            className="w-4 h-4 cursor-pointer hover:scale-110 transition"
            onClick={() => setSearch('')}
            title="Clear search"
          />
        </div>
      )}

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCourse.length > 0 ? (
          filteredCourse.map((course, index) => (
            <CourseCard key={index} course={course} />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-10">
            {search ? "No courses match your search" : "No courses available"}
          </div>
        )}
      </div>
    </div>
    <Footer/>
    </>
  )
}

export default CourseList
