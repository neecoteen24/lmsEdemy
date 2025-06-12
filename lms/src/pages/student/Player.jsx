import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { useParams } from 'react-router-dom';
import { assets } from '../../assets/assets';
import humanizeDuration from 'humanize-duration';
import YouTube from 'react-youtube';
import Footer from '../../components/educator/Footer';
import Rating from '../../components/student/Rating';

const Player = () => {
  const { enrolledCourses, calculateChapterTime } = useContext(AppContext);
  const { courseId } = useParams();

  const [courseData, setCourseData] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [playerData, setPlayerData] = useState(null);

  useEffect(() => {
    const found = enrolledCourses.find((course) => course._id === courseId);
    if (found) setCourseData(found);
  }, [enrolledCourses, courseId]);

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
 
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
                          src={false ? assets.blue_tick_icon : assets.play_icon}
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
          <Rating initialRating={0} />
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
            <button className='text-blue-600'>{false ? 'Completed' : 'Mark Complete'}</button>
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
  ) : (
    <div className="p-10 text-center text-gray-500">Loading course...</div>
    
   
  );
};

export default Player;
