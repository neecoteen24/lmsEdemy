import React, { useEffect, useRef, useState,useContext } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const AddCourse = () => {

  const {backendUrl, getToken} = useContext(AppContext)
  const quillRef = useRef(null);
  const editorRef = useRef(null);

  const [courseTitle, setCourseTitle] = useState('');
  const [coursePrice, setCoursePrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(null);
  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: '',
    lectureDuration: '',
    lectureUrl: '',
    isPreviewFree: false,
  });

  const handleSubmit = async(e)=>{
    e.preventDefault();
    try {
      if(!thumbnail){
        toast.error('Please upload a thumbnail');
        return;
      }

      // Ensure all chapters and lectures have required fields
      const chaptersWithIds = chapters.map((chapter, chapterIdx) => ({
        ...chapter,
        chapterId: chapter.chapterId || `chapter${chapterIdx + 1}`,
        chapterOrder: chapter.chapterOrder || chapterIdx + 1,
        chapterContent: chapter.chapterContent.map((lecture, lectureIdx) => ({
          ...lecture,
          lectureId: lecture.lectureId || `lecture${lectureIdx + 1}`,
          lectureOrder: lecture.lectureOrder || lectureIdx + 1,
        }))
      }));

      const courseData = {
        courseTitle,
        courseDescription: quillRef.current.root.innerHTML,
        coursePrice: Number(coursePrice),
        discount: Number(discount),
        courseContent: chaptersWithIds,
      } 
      
      const formData = new FormData();
      formData.append('courseData', JSON.stringify(courseData));
      formData.append('image', thumbnail);

      const token = await getToken();
      const {data} = await axios.post(backendUrl + '/api/educator/add-course', formData, {headers: {Authorization: `Bearer ${token}`}});

      if(data.success){
        toast.success(data.message);
        setCourseTitle('');
        setCoursePrice('');
        setDiscount('');
        setThumbnail(null);
        setPreviewUrl(null);
        setChapters([]);
        quillRef.current.root.innerHTML = '';
      } else {
        toast.error(data.message);
      }
    } catch(error) {
      toast.error(error.message);
    }
  }

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder: 'Type Here',
      });
    }
  }, []);

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    setThumbnail(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

const handleAddChapter = () => {
  const chapterName = prompt("Enter chapter name:");
  if (!chapterName) return;

  const newChapter = {
    chapterId: `chapter${chapters.length + 1}`,
    chapterOrder: chapters.length + 1,
    chapterTitle: chapterName,
    chapterContent: [],
    collapsed: false,
  };

  setChapters([...chapters, newChapter]);
};


  const toggleCollapse = (index) => {
    setChapters(prev =>
      prev.map((ch, i) =>
        i === index ? { ...ch, collapsed: !ch.collapsed } : ch
      )
    );
  };

  const handleAddLecture = () => {
    const updatedChapters = [...chapters];
    const chapter = updatedChapters[selectedChapterIndex];
    const lectureOrder = chapter.chapterContent.length + 1;
    const lectureId = `lecture${lectureOrder}`;
    const newLecture = {
      ...lectureDetails,
      lectureOrder,
      lectureId,
    };
    chapter.chapterContent.push(newLecture);
    setChapters(updatedChapters);

    setLectureDetails({
      lectureTitle: '',
      lectureDuration: '',
      lectureUrl: '',
      isPreviewFree: false,
    });
    setShowPopup(false);
  };

  const handleDeleteChapter = (index) => {
    setChapters(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteLecture = (chapterIndex, lectureIndex) => {
    const updatedChapters = [...chapters];
    updatedChapters[chapterIndex].chapterContent.splice(lectureIndex, 1);
    setChapters(updatedChapters);
  };

  return (
    <div className="h-screen overflow-scroll flex flex-col items-start md:p-8 p-4 pt-8">
      <form
        className="flex flex-col gap-4 w-full max-w-xl"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-1">
          <p>Course Title</p>
          <input
            type="text"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            placeholder="Type here"
            className="outline-none py-2 px-3 border border-gray-400 rounded"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <p>Course Description</p>
          <div
            ref={editorRef}
            className="border rounded min-h-[150px] px-2 py-1"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col gap-1">
            <p>Course Price</p>
            <input
              type="number"
              value={coursePrice}
              onChange={(e) => setCoursePrice(e.target.value)}
              placeholder="0"
              className="outline-none py-2 px-3 border border-gray-400 rounded w-28"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <p>Discount %</p>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="0"
              min={0}
              max={100}
              className="outline-none py-2 px-3 border border-gray-400 rounded w-28"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <p>Course Thumbnail</p>
            <label htmlFor="thumbnailImage" className="flex items-center gap-2">
              <img
                src={assets.file_upload_icon}
                alt=""
                className="p-2 bg-blue-500 rounded cursor-pointer"
              />
              <input
                type="file"
                id="thumbnailImage"
                onChange={handleThumbnailUpload}
                accept="image/*"
                hidden
              />
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Thumbnail Preview"
                  className="w-20 h-14 object-cover rounded"
                />
              )}
            </label>
          </div>
        </div>

        {/* Chapters UI */}
        <div className="flex flex-col gap-2">
          {chapters.map((chapter, chapterIndex) => (
            <div key={chapterIndex} className="bg-white border rounded-lg mb-4">
              <div className="flex justify-between items-center p-4 border-b">
                <div className="flex items-center gap-2">
                  <img
                    src={assets.dropdown_icon}
                    width={14}
                    className={`cursor-pointer transition-transform ${
                      chapter.collapsed ? '-rotate-90' : ''
                    }`}
                    onClick={() => toggleCollapse(chapterIndex)}
                  />
                  <span className="font-semibold">
                    {chapterIndex + 1}. {chapter.chapterTitle}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span>{chapter.chapterContent.length} Lectures</span>
                  <img
                    src={assets.cross_icon}
                    alt=""
                    className="cursor-pointer"
                    onClick={() => handleDeleteChapter(chapterIndex)}
                  />
                </div>
              </div>

              {!chapter.collapsed && (
                <div className="p-4">
                  {chapter.chapterContent.map((lecture, lectureIndex) => (
                    <div
                      key={lectureIndex}
                      className="flex justify-between items-center mb-2"
                    >
                      <span>
                        {lectureIndex + 1}. {lecture.lectureTitle} -{' '}
                        {lecture.lectureDuration} mins -{' '}
                        <a
                          href={lecture.lectureUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-500"
                        >
                          Link
                        </a>{' '}
                        - {lecture.isPreviewFree ? 'Free Preview' : 'Paid'}
                      </span>
                      <img
                        src={assets.cross_icon}
                        alt=""
                        className="cursor-pointer"
                        onClick={() =>
                          handleDeleteLecture(chapterIndex, lectureIndex)
                        }
                      />
                    </div>
                  ))}

                  <div
                    className="inline-flex bg-gray-100 p-2 rounded cursor-pointer mt-2"
                    onClick={() => {
                      setSelectedChapterIndex(chapterIndex);
                      setShowPopup(true);
                    }}
                  >
                    + Add Lecture
                  </div>
                </div>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddChapter}
            className="bg-blue-100 text-blue-700 rounded py-2 px-4"
          >
            + Add Chapter
          </button>
        </div>

        <button
          type="submit"
          className="bg-black text-white px-5 py-2 rounded mt-4 w-fit"
        >
          ADD
        </button>
      </form>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white text-gray-700 p-4 rounded relative w-full max-w-80">
            <h2 className="text-lg font-semibold mb-4">Add Lecture</h2>

            <div className="mb-2">
              <p>Lecture Title</p>
              <input
                type="text"
                className="mt-1 block w-full border rounded py-1 px-2"
                value={lectureDetails.lectureTitle}
                onChange={(e) =>
                  setLectureDetails({
                    ...lectureDetails,
                    lectureTitle: e.target.value,
                  })
                }
              />
            </div>

            <div className="mb-2">
              <p>Duration (minutes)</p>
              <input
                type="number"
                className="mt-1 block w-full border rounded py-1 px-2"
                value={lectureDetails.lectureDuration}
                onChange={(e) =>
                  setLectureDetails({
                    ...lectureDetails,
                    lectureDuration: e.target.value,
                  })
                }
              />
            </div>

            <div className="mb-2">
              <p>Lecture URL</p>
              <input
                type="text"
                className="mt-1 block w-full border rounded py-1 px-2"
                value={lectureDetails.lectureUrl}
                onChange={(e) =>
                  setLectureDetails({
                    ...lectureDetails,
                    lectureUrl: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex gap-2 my-4 items-center">
              <p>Is Preview Free</p>
              <input
                type="checkbox"
                className="mt-1 scale-125"
                checked={lectureDetails.isPreviewFree}
                onChange={(e) =>
                  setLectureDetails({
                    ...lectureDetails,
                    isPreviewFree: e.target.checked,
                  })
                }
              />
            </div>

            <button
              type="button"
              onClick={handleAddLecture}
              className="w-full bg-blue-400 text-white px-4 py-2 rounded"
            >
              Add
            </button>

            <img
              onClick={() => setShowPopup(false)}
              src={assets.cross_icon}
              className="absolute top-4 right-4 w-4 cursor-pointer"
              alt="close"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCourse;
