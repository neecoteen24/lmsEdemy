import React, { useEffect, useState, useContext } from 'react'
import Loading from '../../components/student/Loading'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const StudentsEnrolled = () => {

  const {backendUrl, getToken, isEducator} = useContext(AppContext)
  const [enrolledStudents, setEnrolledStudents] = useState(null)

  const fetchEnrolledStudents = async () => {
    try {
      const token = await getToken()
      const {data} = await axios.get(backendUrl + '/api/educator/enrolled-students', {headers: {Authorization: `Bearer ${token}`}})
      if(data.success){
        setEnrolledStudents(data.enrolledStudents.reverse())
      }
      else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if(isEducator){
      fetchEnrolledStudents()
    }
  }, [isEducator])

  useEffect(() => {
    fetchEnrolledStudents()
  }, [])

  return enrolledStudents ? (
    <div className='p-6 w-full'>
      <h2 className='text-xl font-semibold mb-4'>Student Enrolled</h2>
      <div className='overflow-x-auto rounded-md shadow-sm border border-gray-200'>
        <table className='w-full text-sm text-left text-gray-700'>
          <thead className='bg-gray-50 text-gray-900 border-b'>
            <tr>
              <th className='px-6 py-3 font-semibold'>#</th>
              <th className='px-6 py-3 font-semibold'>Student name</th>
              <th className='px-6 py-3 font-semibold'>Course Title</th>
              <th className='px-6 py-3 font-semibold'>Date</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200 bg-white'>
            {enrolledStudents.map((item, index) => (
              <tr key={index} className='hover:bg-gray-50'>
                <td className='px-6 py-4'>{index + 1}</td>
                <td className='px-6 py-4 flex items-center space-x-2'>
                  <img
                    src={item.student.imageUrl}
                    alt='Student'
                    className='w-8 h-8 rounded-full object-cover'
                  />
                  <span>{item.student.name}</span>
                </td>
                <td className='px-6 py-4'>{item.courseTitle}</td>
                <td className='px-6 py-4'>{new Date(item.purchaseData).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ) : (
    <Loading />
  )
}

export default StudentsEnrolled
