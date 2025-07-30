import React, { useState } from 'react';
import { Sparkles, ImageIcon } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const GenerateImages = () => {
  const [style, setStyle] = useState('Realistic');
  const [input, setInput] = useState('');
  const [publish, setPublish] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');

  const { getToken } = useAuth();

  const ImageStyles = [
    'Realistic',
    'Ghibli style',
    'Anime style',
    'Cartoon style',
    'Fantasy style',
    'Realistic style',
    '3D style',
    'Portrait style',
  ];

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const prompt = `Generate an image of ${input} in the style ${style}`;
      const token = await getToken();

      const { data } = await axios.post(
        '/api/ai/generate-image',
        { prompt, publish },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success && data.secure_url) {
        setContent(data.secure_url); // ✅ use the Cloudinary URL returned by backend
      } else {
        toast.error(data.message || 'Something went wrong');
      }
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='h-full p-6 text-slate-700 flex flex-col md:flex-row gap-4 overflow-y-auto'>
      {/* Left Column */}
      <form
        onSubmit={onSubmitHandler}
        className='w-full md:w-1/2 bg-white border border-gray-200 rounded-lg p-5 flex flex-col max-h-[90vh]'
      >
        <div className='flex-grow overflow-y-auto'>
          <div className='flex items-center gap-3'>
            <Sparkles className='w-6 text-green-600' />
            <h1 className='text-xl font-semibold'>AI Image Generator</h1>
          </div>

          <p className='mt-6 text-sm font-medium'>Describe Your Image</p>
          <textarea
            rows={4}
            className='w-full mt-2 p-2 px-3 text-sm border border-gray-300 rounded-md outline-none resize-none'
            placeholder='Describe what you want to see in the image...'
            required
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <p className='mt-4 text-sm font-medium'>Style</p>
          <div className='mt-3 flex gap-2 flex-wrap'>
            {ImageStyles.map((s) => (
              <span
                key={s}
                onClick={() => setStyle(s)}
                className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${
                  style === s
                    ? 'bg-green-50 text-green-700 border-green-500'
                    : 'text-gray-500 border-gray-300'
                }`}
              >
                {s}
              </span>
            ))}
          </div>

          {/* Toggle switch */}
          <div className='mt-6 flex items-center gap-3'>
            <label className='relative cursor-pointer'>
              <input
                type='checkbox'
                onChange={(e) => setPublish(e.target.checked)}
                checked={publish}
                className='sr-only peer'
              />
              <div className='w-9 h-5 bg-slate-300 rounded-full peer-checked:bg-green-500 transition'></div>
              <span className='absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition peer-checked:translate-x-4'></span>
            </label>
            <p className='text-sm'>Make this image Public</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className='pt-4'>
          <button
            disabled={loading}
            type='submit'
            className='w-full bg-gradient-to-r from-green-500 to-green-600 text-white text-sm rounded-lg py-2 flex justify-center items-center gap-2 cursor-pointer'
          >
            {loading ? (
              <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
            ) : (
              <ImageIcon className='w-5' />
            )}
            Generate image
          </button>
        </div>
      </form>

      {/* Right Column - Output */}
      <div className='w-full md:w-1/2 bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between min-h-[400px] md:min-h-[600px]'>
        <div className='flex items-center gap-3'>
          <ImageIcon className='w-5 h-5 text-green-600' />
          <h1 className='text-xl font-semibold'>Generated image</h1>
        </div>

        <div className='flex-1 flex justify-center items-center'>
          {!content ? (
            <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
              <ImageIcon className='w-9 h-9' />
              <p>Describe an image and click “Generate Image” to get started</p>
            </div>
          ) : (
            <div className='mt-3 h-full w-full'>
              <img
                src={content}
                alt='Generated'
                className='w-full h-full object-contain rounded-md'
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateImages;
