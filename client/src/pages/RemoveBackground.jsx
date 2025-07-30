import React, { useState } from 'react';
import { ImageIcon, UploadCloud } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveBackground = () => {
  const [imageFile, setImageFile] = useState(null);
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setProcessedImageUrl(null); // Reset output when a new file is selected
    }
  };

  const handleRemoveBackground = async (e) => {
    e.preventDefault();

    if (!imageFile) return toast.error("Please upload an image");

    setLoading(true);
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append("image", imageFile);

      const { data } = await axios.post("/api/ai/remove-image-background", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.success && data.content) {
        setProcessedImageUrl(data.content);
      } else {
        toast.error(data.message || "Background removal failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='h-full p-6 text-slate-700 flex flex-col md:flex-row gap-4 overflow-y-auto'>
      {/* Left - Upload Form */}
      <form
        onSubmit={handleRemoveBackground}
        className='w-full md:w-1/2 bg-white border border-gray-200 rounded-lg p-5 flex flex-col max-h-[90vh]'
      >
        <div className='flex-grow overflow-y-auto'>
          <div className='flex items-center gap-3'>
            <ImageIcon className='w-6 text-orange-500' />
            <h1 className='text-xl font-semibold'>Background Removal</h1>
          </div>

          <p className='mt-6 text-sm font-medium'>Upload Image</p>

          <div className='mt-3'>
            <label
              htmlFor='upload'
              className='flex items-center justify-center gap-2 w-full px-4 py-2 border-2 border-dashed border-orange-400 text-orange-600 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition'
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
            <p className='text-xs text-gray-500 mt-2 text-center'>
              Supports JPG, PNG, and other image formats
            </p>
          </div>
        </div>

        <div className='pt-4'>
          <button
            type='submit'
            disabled={loading}
            className='w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white text-sm rounded-lg py-2 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? (
              <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
            ) : (
              'Remove background'
            )}
          </button>
        </div>
      </form>

      {/* Right - Result */}
      <div className='w-full md:w-1/2 bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between min-h-[400px] md:min-h-[600px]'>
        <div className='flex items-center gap-3'>
          <ImageIcon className='w-5 h-5 text-orange-500' />
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
              <ImageIcon className='w-9 h-9' />
              <p>Upload an image and click “Remove Background” to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemoveBackground;
