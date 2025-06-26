import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import Loading from '../../components/student/Loading'

const MyCourses = () => {
  const { currency, allCourses } = useContext(AppContext)
  const [courses, setCourses] = useState(null)

  const fetchEducatorCourses = async () => {
    setCourses(allCourses)
  }

  useEffect(() => {
    fetchEducatorCourses()
  }, [])

  return courses ? (
    <div className='h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pb-0'>
      <div className='w-full'>
        <h2 className='pb-4 text-lg font-medium'>My Courses</h2>
        <div className='overflow-x-auto rounded-md shadow-sm border border-gray-200'>
          <table className='md:table-auto table-fixed w-full text-sm text-left text-gray-700'>
            <thead className='text-gray-900 border-b border-gray-500/20 text-sm text-left bg-gray-50'>
              <tr>
                <th className='px-4 py-3 font-semibold'>All Courses</th>
                <th className='px-4 py-3 font-semibold'>Earnings</th>
                <th className='px-4 py-3 font-semibold'>Students</th>
                <th className='px-4 py-3 font-semibold'>Published On</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {courses.map((course) => (
                <tr key={course._id} className='bg-white hover:bg-gray-50'>
                  <td className='md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate'>
                    <img src={course.courseThumbnail} alt="Course Image" className="w-16 rounded" />
                    <span className='truncate hidden md:block'>{course.courseTitle}</span>
                  </td>
                  <td className='px-4 py-3'>
                    {currency}
                    {Math.floor(
                      course.enrolledStudents.length *
                      (course.coursePrice - (course.discount * course.coursePrice / 100))
                    )}
                  </td>
                  <td className='px-4 py-3'>{course.enrolledStudents.length}</td>
                  <td className='px-4 py-3'>
                    {new Date(course.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ) : <Loading />
}

export default MyCourses
