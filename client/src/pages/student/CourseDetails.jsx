import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import Loading from '../../components/student/Loading'
import { assets } from '../../assets/assets'
import humanizeDuration from 'humanize-duration'
import Footer from '../../components/student/Footer'
import YouTube from 'react-youtube'

const CourseDetails = () => {
  const { id } = useParams()
  const [courseData, setCourseData] = useState(null)
  const [openSections, setOpenSections] = useState({}) // Track open sections
   const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false)
   const [playerData, setPlayerData] = useState(null)

  const { allCourses, calculateRating, calculateChapterTime, 
    calculateNoOfLectures, calculateCourseDuration ,currency} = useContext(AppContext)

  const fetchCourseData = async () => {
    const findCourse = allCourses.find(course => course._id === id)
    setCourseData(findCourse)
  }

  useEffect(() => {
    fetchCourseData()
  }, [allCourses])

  // Toggle section visibility
  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],  // Toggle the current section
    }))
  }

  return courseData ? (
    <>
      <div className='relative z-10 flex md:flex-row flex-col-reverse gap-10 items-start justify-between md:px-36 px-8 md:pt-30 pt-20 text-left'>
        {/* Gradient background */}
        <div className='absolute top-0 left-0 w-full h-full z-0 bg-gradient-to-b from-cyan-100 to-white'></div>

        {/* Left column */}
        <div className='max-w-xl z-10 text-gray-500'>
          <h1 className='md:text-course-details-heading-large text-course-details-heading-small font-semibold text-gray-800'>
            {courseData.courseTitle}
          </h1>
          <p
            className='pt-4 md:text-base text-sm'
            dangerouslySetInnerHTML={{ __html: courseData.courseDescription.slice(0, 200) }}
          ></p>

          {/* Review and ratings */}
          <div className='flex items-center space-x-2 mt-4 pt-3 pb-1 text-sm'>
            {(() => {
              const rating = calculateRating(courseData)
              return (
                <>
                  <p>{rating.toFixed(1)}</p>
                  <div className='flex'>
                    {[...Array(5)].map((_, i) => (
                      <img
                        key={i}
                        src={i < Math.round(rating) ? assets.star : assets.star_blank}
                        alt='star'
                        className='w-4 h-4'
                      />
                    ))}
                  </div>
                  <p className='text-blue-600'>({courseData.courseRatings.length}
                    {courseData.courseRatings.length > 1 ? 'ratings' : 'rating'})</p>

                    <p>{courseData.enrolledStudents.length} {courseData.enrolledStudents.length > 1 ? 'students': 'students'}</p>
                </>
              )
            })()}
          </div>

            <p className='text-sm'>Course by <span className='text-blue-600 underline'>Anurag</span></p>

            <div className='pt-8 text-gray-800'>
              <h2 className='text-xl font-semibold'>Course Structure</h2>

              <div className='pt-5'>
       {courseData.courseContent.map((chapter, index) => (
          <div key={index} className="border border-gray-300 bg-white mb-4 rounded-md shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 cursor-pointer select-none bg-gray-50 font-medium text-sm md:text-base" onClick={()=> toggleSection(index)}>
              <div className="flex items-center gap-2">
               <img 
                className={`transform transition-transform ${openSections[index] ? 'rotate-180' : ''} w-4 h-4`} 
                src={assets.down_arrow_icon} 
                alt="arrow icon" 
               />
                <span>{chapter.chapterTitle}</span>
              </div>
              <span className="text-sm text-gray-600">
                {chapter.chapterContent.length} lectures – {calculateChapterTime(chapter)}
              </span>
            </div>

            {/* Show the chapter content if the section is open */}
            {openSections[index] && (
              <div className="border-t border-gray-200 px-6 py-2">
                {chapter.chapterContent.map((lecture, i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b last:border-b-0 text-sm text-gray-800">
                    <div className="flex items-center gap-2">
                      <img src={assets.play_icon} alt="play icon" className="w-4 h-4" />
                      <span>{lecture.lectureTitle}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs md:text-sm">
                      {lecture.isPreviewFree && (
                        <span onClick={() => setPlayerData({
                          videoId: lecture.lectureUrl.split('/').pop()
                        })} className="text-blue-500 cursor-pointer hover:underline">Preview</span>
                      )}
                      <span>{humanizeDuration(lecture.lectureDuration * 60 * 1000, { units: ['m'], round: true })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

              </div>

            </div>

          <div>
            <h3 className='text-xl font-semibold text-gray-800'>Course Description</h3>
            <p className='pt-3 rich-text'
            dangerouslySetInnerHTML={{ __html: courseData.courseDescription }}></p>
          </div>
        </div>

        {/* Right column */}
        <div className='max-w-course-card z-10 shadow-custom-card rounded-t md:rounded-none overflow-hidden bg-white min-w-[300px] sm:min-w-[420px]'>

          {
          playerData ? <YouTube videoId={playerData.videoId} opts={{playerVars: {autoplay: 1}}}iframeClassName='w-full aspect-video' />
                 :   <img src={courseData.courseThumbnail} alt="" />
                 }
          
          <div className='p-5'>
            <div className='flex items-center gap-2'>

               <img className='w-3.5' src={assets.time_left_clock_icon} alt='time-left-clock-icon' />
            
          
            <p className='text-red-500'><span className='font-medium'></span>5 days left at this price!</p>
            </div>
            <div className='flex gap-3 items-center pt-2'>
              <p className='text-lg font-semibold text-gray-800'>{currency}{(courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2)} </p>
              <p className='text-sm line-through text-gray-500'>{currency}{courseData.coursePrice} </p>
              <p className='text-sm text-gray-500 font-medium'>{courseData.discount}% off</p>
            </div>

            <div className='flex items-center text-sm md:text-default gap-4 pt-2 md:pt-4 text-gray-500 '>
              <div className='flex items-center gap-1'>
                <img src={assets.star} alt='star icon' />
                <p>{calculateRating(courseData)} </p>
              </div>
              <div className='h-4 w-px bg-gray-500/40'></div>

              <div className='flex items-center gap-1'>
                <img src={assets.time_clock_icon} alt='clock icon' />
                <p>{calculateCourseDuration(courseData)} </p>
              </div>

               <div className='h-4 w-px bg-gray-500/40'></div>

               <div className='flex items-center gap-1'>
                <img src={assets.lesson_icon} alt='clock icon' />
                <p>{calculateNoOfLectures(courseData)} lessons </p>
              </div>


            </div>

            <button className='md:mt-6 mt-4 w-full py-3 rounded bg-blue-600 text-white font-medium'>{isAlreadyEnrolled ? 'Already Enrolled' : 'Enroll Now'} </button>

            <div className='pt-6'>
              <p className='md:text-xl text-lg font-medium text-gray-800'>What’s in the course?</p>
              <ul className=" ml-4 pt-2 text-sm md:text-default list-disc text-gray-500">
                <li>Lifetime access with free updates</li>
                <li>Hands-on projects and real-world case studies</li>
                <li>Downloadable resources and cheat sheets</li>
                <li>Certificate of completion</li>
                <li>24/7 doubt support via community & forums</li>
                <li>Quizzes and assignments for better understanding</li>
                <li>Access on mobile, tablet, and desktop</li>
                <li>Interview preparation and portfolio guidance</li>
              </ul>
            </div>



          </div>
        </div>
      </div>
      <Footer />
    </>
  ) : (
    <Loading />
  )
}

export default CourseDetails
