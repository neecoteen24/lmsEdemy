import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import { useAuth, useUser } from "@clerk/clerk-react";

// Create context with default value
export const AppContext = createContext({});

export const AppContextProvider = (props) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();

  const { getToken } = useAuth();
  const { user } = useUser();

  const [allCourses, setAllCourses] = useState([]);
  const [isEducator, setIsEducator] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  // Fetch all courses (dummy for now)
  const fetchAllCourses = async () => {
    setAllCourses(dummyCourses);
  };

  // Fetch user enrolled courses (dummy for now)
  const fetchUserEnrolledCourses = async () => {
    setEnrolledCourses(dummyCourses);
  };

  // Calculate average course rating
  const calculateRating = (course) => {
    if (!course.courseRatings.length) return 0;

    const totalRating = course.courseRatings.reduce(
      (sum, rating) => sum + rating.rating,
      0
    );

    return totalRating / course.courseRatings.length;
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
    fetchUserEnrolledCourses();
  }, []);

  // Log token when user is available
  useEffect(() => {
    const logToken = async () => {
      try {
        const token = await getToken();
        console.log("Clerk Token:", token);
      } catch (error) {
        console.error("Failed to get Clerk token:", error);
      }
    };

    if (user) {
      logToken();
    }
  }, [user, getToken]);

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
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};
