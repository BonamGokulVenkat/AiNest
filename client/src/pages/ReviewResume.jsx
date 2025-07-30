import React, { useState } from 'react';
import { FileText, UploadCloud } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const ResumeReview = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState('');
  const [loading, setLoading] = useState(false);

  const { getToken } = useAuth();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
      setAnalysisResult('');
    }
  };

  const handleReviewResume = async (e) => {
    e.preventDefault();

    if (!resumeFile) return toast.error("Please upload your resume");

    try {
      setLoading(true);
      const token = await getToken();
      const formData = new FormData();
      formData.append("resume", resumeFile);

      const { data } = await axios.post("/api/ai/resume-review", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.success && data.content) {
        setAnalysisResult(data.content);
      } else {
        toast.error(data.message || "Review failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='h-full p-6 text-slate-700 flex flex-col md:flex-row gap-4 overflow-y-auto'>

      {/* Upload Section */}
      <form
        onSubmit={handleReviewResume}
        className='w-full md:w-1/2 bg-white border border-gray-200 rounded-lg p-5 flex flex-col max-h-[90vh]'
      >
        <div className='flex-grow overflow-y-auto'>
          <div className='flex items-center gap-3'>
            <FileText className='w-6 text-emerald-500' />
            <h1 className='text-xl font-semibold'>Resume Review</h1>
          </div>

          <p className='mt-6 text-sm font-medium'>Upload Resume</p>

          <div className='mt-3'>
            <label
              htmlFor='resume-upload'
              className='flex items-center justify-center gap-2 w-full px-4 py-2 border-2 border-dashed border-emerald-400 text-emerald-600 bg-emerald-50 rounded-lg cursor-pointer hover:bg-emerald-100 transition'
            >
              <UploadCloud className='w-5 h-5' />
              <span>{resumeFile ? resumeFile.name : 'Choose File'}</span>
            </label>
            <input
              id='resume-upload'
              type='file'
              accept='.pdf,.png,.jpg'
              onChange={handleFileChange}
              className='hidden'
              required
            />
            <p className='text-xs text-gray-500 mt-2 text-center'>
              Supports PDF, PNG, JPG formats (max 5MB)
            </p>
          </div>
        </div>

        <div className='pt-4'>
          <button
            type='submit'
            disabled={loading}
            className='w-full bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-sm rounded-lg py-2 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50'
          >
            {loading ? (
              <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
            ) : (
              "Review Resume"
            )}
          </button>
        </div>
      </form>

      {/* Analysis Result Section */}
      <div className='w-full md:w-1/2 bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between min-h-[400px] md:min-h-[600px]'>
        <div className='flex items-center gap-3'>
          <FileText className='w-5 h-5 text-emerald-500' />
          <h1 className='text-xl font-semibold'>Analysis Results</h1>
        </div>

        <div className='flex-1 mt-3 overflow-y-auto pr-2 text-sm text-slate-700'>
          {analysisResult ? (
            <div className='prose prose-sm max-w-none whitespace-pre-wrap reset-tw'>
              <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {analysisResult}
              </Markdown>
            </div>
          ) : (
            <div className='flex justify-center items-center h-full text-gray-400 flex-col gap-4'>
              <FileText className='w-9 h-9' />
              <p>Upload your resume and click “Review Resume” to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeReview;
