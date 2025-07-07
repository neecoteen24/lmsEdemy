import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { assets, dummyDashboardData } from '../../assets/assets'
import Loading from '../../components/student/Loading'
import axios from 'axios'
import { toast } from 'react-toastify'

const Dashboard = () => {

  const { currency, backendUrl, getToken, isEducator } = useContext(AppContext)
  const [dashboardData, setDashboardData] = useState(null)


  const fetchDashboardData = async () => {
    try {
      const token = await getToken()
      const {data} = await axios.get(backendUrl + '/api/educator/dashboard', {headers: {Authorization: `Bearer ${token}`}})
      if(data.success){
        setDashboardData(data.dashboardData)
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
      fetchDashboardData()
    }
  }, [isEducator])

  return dashboardData ? (
    <div className='min-h-screen flex-col items-start justify-between gap-8 md:pb-0 p-4 pt-8 pb-0'>
      
      {/* Top Stats */}
      <div className='space-y-5'>
        <div className='flex flex-wrap gap-5 items-center'>
          <div className='flex gap-3 items-center shadow-custom-card border-blue-500 p-4 w-56 rounded-md'>
            <img src={assets.patients_icon} alt='patients icon' />
            <div>
              <p className='text-2xl font-medium text-gray-600'>
                {dashboardData.enrolledStudentsData.length}
              </p>
              <p className='text-base text-gray-500'>Total Enrollments</p>
            </div>
          </div>
          <div className='flex gap-3 items-center shadow-custom-card border-blue-500 p-4 w-56 rounded-md'>
            <img src={assets.appointments_icon} alt='appointments icon' />
            <div>
              <p className='text-2xl font-medium text-gray-600'>
                {dashboardData.totalCourses}
              </p>
              <p className='text-base text-gray-500'>Total Courses</p>
            </div>
          </div>
          <div className='flex gap-3 items-center shadow-custom-card border-blue-500 p-4 w-56 rounded-md'>
            <img src={assets.earning_icon} alt='earning icon' />
            <div>
              <p className='text-2xl font-medium text-gray-600'>
                {currency}{dashboardData.totalEarnings}
              </p>
              <p className='text-base text-gray-500'>Total Earnings</p>
            </div>
          </div>
        </div>
        
        {/* Latest Enrollments */}
        <div>
          <h2 className='pb-4 text-lg font-medium'>Latest Enrollments</h2>
          <div className='overflow-x-auto rounded-md shadow-sm border border-gray-200'>
  <table className='w-full text-sm text-left text-gray-700'>
    <thead className='bg-gray-50 text-gray-500 font-medium'>
      <tr>
        <th className='px-6 py-3 text-center'>#</th>
        <th className='px-6 py-3'>Student Name</th>
        <th className='px-6 py-3'>Course Title</th>
      </tr>
    </thead>
    <tbody className='divide-y divide-gray-200'>
      {dashboardData.enrolledStudentsData.map((item, index) => (
        <tr key={index} className='bg-white hover:bg-gray-50'>
          <td className='px-6 py-4 text-center'>{index + 1}</td>
          <td className='px-6 py-4 flex items-center gap-3'>
            <img
              src={item.student.imageUrl}
              alt='Profile'
              className='w-6 h-6 rounded-full object-cover'
            />
            <span className='font-medium text-gray-800'>{item.student.name}</span>
          </td>
          <td className='px-6 py-4 text-gray-700'>{item.courseTitle}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

        </div>
      </div>
    </div>
  ) : (
    <Loading />
  )
}

export default Dashboard
