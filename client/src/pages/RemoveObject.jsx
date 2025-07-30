import React, { useState } from 'react';
import { Scissors, UploadCloud } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveObject = () => {
  const [imageFile, setImageFile] = useState(null);
  const [description, setDescription] = useState('');
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setProcessedImageUrl(null);
    }
  };

  const handleRemoveObject = async (e) => {
    e.preventDefault();
    if (!imageFile || !description.trim()) {
      return toast.error('Please upload an image and describe the object to remove.');
    }

    setLoading(true);

    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('object', description);

      const { data } = await axios.post('/api/ai/remove-image-object', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (data.success && data.content) {
        setProcessedImageUrl(data.content);
      } else {
        toast.error(data.message || 'Object removal failed');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='h-full p-6 text-slate-700 flex flex-col md:flex-row gap-4 overflow-y-auto'>
      {/* Left Column */}
      <form
        onSubmit={handleRemoveObject}
        className='w-full md:w-1/2 bg-white border border-gray-200 rounded-lg p-5 flex flex-col max-h-[90vh]'
      >
        <div className='flex-grow overflow-y-auto'>
          <div className='flex items-center gap-3'>
            <Scissors className='w-6 text-indigo-500' />
            <h1 className='text-xl font-semibold'>Object Removal</h1>
          </div>

          <p className='mt-6 text-sm font-medium'>Upload Image</p>

          <div className='mt-3'>
            <label
              htmlFor='upload'
              className='flex items-center justify-center gap-2 w-full px-4 py-2 border-2 border-dashed border-indigo-400 text-indigo-600 bg-indigo-50 rounded-lg cursor-pointer hover:bg-indigo-100 transition'
            >
              <UploadCloud className='w-5 h-5' />
              <span>{imageFile ? imageFile.name : 'Choose File'}</span>
            </label>
            <input
              id='upload'
              type='file'
              accept='image/*'
              onChange={handleFileChange}
              className='hidden'
              required
            />
          </div>

          <p className='mt-6 text-sm font-medium'>Describe object to remove</p>
          <textarea
            rows={3}
            placeholder='e.g., tree on the right, person in background'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className='w-full mt-2 p-2 px-3 text-sm border border-gray-300 rounded-md outline-none resize-none'
            required
          />

          <p className='text-xs text-gray-500 mt-2'>
            Be specific to improve accuracy (e.g., "person in red shirt")
          </p>
        </div>

        {/* Submit Button */}
        <div className='pt-4'>
          <button
            type='submit'
            disabled={loading}
            className='w-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm rounded-lg py-2 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? (
              <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
            ) : (
              <>
                <Scissors className='w-4 h-4' />
                Remove object
              </>
            )}
          </button>
        </div>
      </form>

      {/* Right Column - Processed Image */}
      <div className='w-full md:w-1/2 bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between min-h-[400px] md:min-h-[600px]'>
        <div className='flex items-center gap-3'>
          <Scissors className='w-5 h-5 text-indigo-500' />
          <h1 className='text-xl font-semibold'>Processed Image</h1>
        </div>

        <div className='flex-1 flex justify-center items-center'>
          {processedImageUrl ? (
            <img
              src={processedImageUrl}
              alt='Processed'
              className='rounded-md max-w-full max-h-[300px] object-contain'
            />
          ) : (
            <div className='text-sm flex flex-col items-center gap-5 text-gray-400 text-center'>
              <Scissors className='w-9 h-9' />
              <p>Upload an image and describe what to remove</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemoveObject;
