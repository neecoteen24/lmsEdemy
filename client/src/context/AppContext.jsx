import { createContext, useEffect, useState } from "react";
//import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from 'axios'
import { toast } from "react-toastify";

// Create context with default value
export const AppContext = createContext({});

export const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();

  const { getToken } = useAuth();
  const { user } = useUser();

  const [allCourses, setAllCourses] = useState([]);
  const [isEducator, setIsEducator] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [userData, setUserData] = useState(null);

  // Fetch all courses (dummy for now)
  const fetchAllCourses = async ()=>{
    try {
      const {data} = await axios.get(backendUrl + '/api/course/all')

      if(data.success){
        setAllCourses(data.courses)
      } else{
        toast.error(data.message)
      }
     } catch (error) {
      toast.error(error.message)
     }
  };

  //Fetch user data
  const fetchUserData = async ()=>{

    if(user.publicMetadata.role === 'educator'){
      setIsEducator(true)
    }

    try {
      const token = await getToken();

      const {data} = await axios.get(backendUrl + '/api/user/data',{headers: {Authorization: `Bearer ${token}`}})

      if(data.success){
        setUserData(data.user)
      }else{
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }
  }

  // Fetch user enrolled courses (dummy for now)
  const fetchUserEnrolledCourses = async () => {
    try {
      const token = await getToken()
    const { data } = await axios.get(backendUrl + '/api/user/enrolled-courses',{headers: {Authorization: `Bearer ${token}`}})
    if(data.success){
      setEnrolledCourses(data.enrolledCourses.reverse())
    }else{
      toast.error(data.message)
    }
    } catch (error) {
      toast.error(error.message)
    }
  };

  // Calculate average course rating
  const calculateRating = (course) => {
    if (!course.courseRatings.length) return 0;

    const totalRating = course.courseRatings.reduce(
      (sum, rating) => sum + rating.rating,
      0
    );

    return Math.floor( totalRating / course.courseRatings.length);
  };

  // Calculate time for a chapter
  const calculateChapterTime = (chapter) => {
    let time = 0;
    chapter.chapterContent.forEach(
      (lecture) => (time += lecture.lectureDuration)
    );
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  // Calculate full course duration
  const calculateCourseDuration = (course) => {
    let time = 0;
    course.courseContent.forEach((chapter) =>
      chapter.chapterContent.forEach(
        (lecture) => (time += lecture.lectureDuration)
      )
    );
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  // Calculate number of lectures in a course
  const calculateNoOfLectures = (course) => {
    let totalLectures = 0;
    course.courseContent.forEach((chapter) => {
      if (Array.isArray(chapter.chapterContent)) {
        totalLectures += chapter.chapterContent.length;
      }
    });
    return totalLectures;
  };

  // Run on initial mount
  useEffect(() => {
    fetchAllCourses();
    
  }, []);

  // Log token when user is available
  useEffect(() => {

    if (user) {
      
      fetchUserData()
      fetchUserEnrolledCourses();
    }
  }, [user]);

  const value = {
    currency,
    allCourses,
    navigate,
    calculateRating,
    isEducator,
    setIsEducator,
    calculateChapterTime,
    calculateNoOfLectures,
    calculateCourseDuration,
    enrolledCourses,
    fetchUserEnrolledCourses,
    backendUrl, userData, setUserData, getToken , fetchAllCourses
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};
