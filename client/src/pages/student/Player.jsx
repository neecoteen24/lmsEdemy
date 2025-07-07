import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { useParams } from 'react-router-dom';
import { assets } from '../../assets/assets';
import humanizeDuration from 'humanize-duration';
import YouTube from 'react-youtube';
import Footer from '../../components/student/Footer';
import Rating from '../../components/student/Rating';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from '../../components/student/Loading';

const Player = () => {
  const { enrolledCourses, calculateChapterTime,backendUrl, getToken, userData,fetchEnrolledCourses } = useContext(AppContext);
  const { courseId } = useParams();

  const [courseData, setCourseData] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [playerData, setPlayerData] = useState(null);
  const [progressData, setProgressData] =  useState(null)
  const [initialRating, setInitialRating] =  useState(0)

  useEffect(() => {
    const found = enrolledCourses.find((course) => course._id === courseId);
    if (found) {
      setCourseData(found);
      // Set initial rating if user has rated
      if (found.courseRatings && userData) {
        const userRating = found.courseRatings.find((item) => item.userId === userData._id);
        if (userRating) {
          setInitialRating(userRating.rating);
        }
      }
    }
  }, [enrolledCourses, courseId, userData]);

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
  useEffect(()=>{
    if(enrolledCourses.length> 0){
      getCourseData()
    }
  },[enrolledCourses])

  const markLectureAsCompleted = async (lectureId)=>{
    try {
      const token = await getToken()
      const {data} = await axios.post(backendUrl + '/api/user/update-course-progress',{courseId, lectureId},{headers: {Authorization: `Bearer ${token}`}})

      if(data.success){
        toast.success(data.message)
        getCourseProgress()
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const getCourseProgress = async ()=>{
    try {
      const token = await getToken()
      const {data}= await axios.post(backendUrl + '/api/user/get-course-progress',{courseId}, {headers: {Authorization: `Bearer ${token}`}})

      if(data.success){
        setProgressData(data.ProgressData)
      }else{
        toast.error(data.error)
      }
    } catch (error) {
      toast.error(error.message)
      
    }
  }

  const handleRate = async (rating) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        backendUrl + '/api/user/add-rating',
        { courseId, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        fetchEnrolledCourses();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(()=>{
    getCourseProgress()
  },[])
 
  return courseData ? (
    <>
    <div className="p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36">
      {/* Left column – Course structure */}
      <div className="text-gray-800">
        <h2 className="text-xl font-semibold">Course Structure</h2>

        <div className="pt-5">
          {courseData.courseContent.map((chapter, index) => (
            <div key={index} className="border border-gray-300 bg-white mb-4 rounded-md shadow-sm">
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer select-none bg-gray-50 font-medium text-sm md:text-base"
                onClick={() => toggleSection(index)}
              >
                <div className="flex items-center gap-2">
                  <img
                    className={`transform transition-transform ${
                      openSections[index] ? 'rotate-180' : ''
                    } w-4 h-4`}
                    src={assets.down_arrow_icon}
                    alt="arrow icon"
                  />
                  <span>{chapter.chapterTitle}</span>
                </div>
                <span className="text-sm text-gray-600">
                  {chapter.chapterContent.length} lectures – {calculateChapterTime(chapter)}
                </span>
              </div>

              {/* Show the chapter content if open */}
              {openSections[index] && (
                <div className="border-t border-gray-200 px-6 py-2">
                  {chapter.chapterContent.map((lecture, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center py-3 border-b last:border-b-0 text-sm text-gray-800"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={progressData?.lectureCompleted?.includes(lecture.lectureId) ? assets.blue_tick_icon : assets.play_icon}
                          alt="play icon"
                          className="w-4 h-4"
                        />
                        <span>{lecture.lectureTitle}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs md:text-sm">
                        {lecture.lectureUrl && (
                          <span
                            onClick={() =>
                              setPlayerData({
                              ...lecture, chapter: index +1, lecture: i+1
                              })
                            }
                            className="text-blue-500 cursor-pointer hover:underline"
                          >
                            Watch
                          </span>
                        )}
                        <span>
                          {humanizeDuration(lecture.lectureDuration * 60 * 1000, {
                            units: ['m'],
                            round: true,
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className='flex items-center gap-2 py-3 mt-10'>
          <h1 className='text-xl font-bold'>Rate this Course:</h1>
          <Rating initialRating={initialRating} onRate={handleRate} />
        </div>
        
      </div>

      {/* Right column – Player */}
      <div className="w-full bg-white rounded shadow">
        {playerData ? (
          <div className='md:mt-10'>
          <YouTube
            videoId={playerData.lectureUrl.split('/').pop()}
            iframeClassName="w-full aspect-video"/>
          <div className='flex justify-between items-center mt-1'>
            <p>{playerData.chapter}.{playerData.lecture} {playerData.lectureTitle} </p>
            <button onClick={()=> markLectureAsCompleted(playerData.lectureId)} className='text-blue-600'>{progressData?.lectureCompleted?.includes(playerData.lectureId) ? 'Completed' : 'Mark Complete'}</button>
          </div>
          </div>
        ) : (
          <img src={courseData ? courseData.courseThumbnail : ''} alt="Course Thumbnail" className="w-full" />
        )}
        <div className="p-5 text-gray-700 text-sm">
          
        </div>
      </div>
    </div>
    <Footer/>
    </>
  ) : <Loading/>
};

export default Player;
