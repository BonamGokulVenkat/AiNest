import { Sparkles, Hash } from 'lucide-react';
import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';
import { useAuth } from '@clerk/clerk-react';

axios.defaults.baseURL= import.meta.env.VITE_BASE_URL;

const BlogTitles = () => {
  const blogCategories = ['General', 'Technology', 'Business', 'Health', 'Lifestyle', 'Education', 'Travel', 'Food'];
  const [selectedCategory, setSelectedCategory] = useState('General');
  const [input, setInput] = useState('');
  const [loading, setLoading]= useState(false)
  const [content, setContent]= useState('')

  const {getToken} = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
    
      const prompt = `Generate 5 blog title ideas for the keyword "${input}" in the category "${selectedCategory}".
      Group them by difficulty level: Beginner-Friendly, Intermediate, and Advanced.
      Each group should have 1–2 titles.
      Format using proper markdown:
      - Use '###' for level headings
      - Use Bold for level headings
      - Use bullet points (-) for each title
      - Avoid numbering or extra explanation
      - No intro or outro text, just markdown list.`;

      const { data } = await axios.post(
        '/api/ai/generate-blog-title',
        { prompt },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );
    
      if (data.success) {
        setContent(data.content);
      } else {
        toast.error(data.message);
      }
    
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className='h-full overflow-y-auto p-6 flex flex-col lg:flex-row gap-4 text-slate-700'>
      
      {/* Left Column */}
      <form
        onSubmit={onSubmitHandler}
        className='w-full lg:w-1/2 p-4 bg-white rounded-lg border border-gray-200 flex flex-col justify-between min-h-[400px] lg:min-h-[600px]'
      >
        <div>
          <div className='flex items-center gap-3'>
            <Sparkles className='w-6 text-purple-600' />
            <h1 className='text-xl font-semibold'>AI Blog Title Generator</h1>
          </div>

          <p className='mt-6 text-sm font-medium'>Article Topic</p>
          <input
            type='text'
            className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300'
            placeholder='e.g. The future of artificial intelligence'
            required
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <p className='mt-4 text-sm font-medium'>Category</p>
          <div className='mt-3 flex gap-2 flex-wrap'>
            {blogCategories.map((category, index) => (
              <span
                key={index}
                onClick={() => setSelectedCategory(category)}
                className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-purple-50 text-purple-700 border-purple-500'
                    : 'text-gray-500 border-gray-300'
                }`}
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        <button
          disabled={loading}
          type='submit'
          className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'
        >{
          loading ? <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>:<Hash className='w-5' />
        }
          Generate Title
        </button>
      </form>

      {/* Right Column */}
      <div className='w-full lg:w-1/2 p-4 bg-white rounded-lg border border-gray-200 flex flex-col justify-between min-h-[400px] lg:min-h-[600px]'>
        <div className='flex items-center gap-3'>
          <Hash className='w-5 h-5 text-purple-600' />
          <h1 className='text-xl font-semibold'>Generated Title</h1>
        </div>

        <div className='flex-1 flex justify-center items-center'>
          {content ? (
            <div className='text-base text-slate-700 px-6 py-4 text-left leading-7'>
              <div className='prose prose-slate max-w-none'>
                <Markdown>{content}</Markdown>
              </div>
            </div>
          ) : (
            <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
              <Hash className='w-9 h-9' />
              <p>Enter a topic and click “Generate Title” to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogTitles;
