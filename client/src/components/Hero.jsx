import React from 'react'
import { useNavigate } from 'react-router-dom';

const Hero = () => {
    const navigate = useNavigate();
  return (
    <div className='px-4 sm:px-20 xl:px-32 py-24 sm:py-32 bg-[url(/gradientBackground.jpg)] bg-cover bg-no-repeat min-h-screen flex flex-col items-center justify-center text-center'>
       <div className='text-center mb-6'>
            <h1 className='text-3xl sm:text-5xl md:text-6xl 2xl:text-7xl font-semibold leading-tight sm:leading-[1.2]'>
                Create amazing Content <br />
                with <span className='text-primary'>AI tools</span>
            </h1>
            <p className='mt-4 max-w-xs sm:max-w-lg 2xl:max-w-xl text-gray-600 max-sm:text-xs'>
                Transform your content creation with our suite of premium AI tools. Write articles, generate images, and enhance your workflow.
            </p>
       </div>
       <div className='flex flex-wrap justify-center gap-4 text-sm max-sm:text-xs'>
            <button onClick={()=>navigate('/ai')} className='bg-primary text-white px-10 py-3 rounded-lg hover:scale-102 active:scale-95 transition cursor-pointer'>Start creating now</button>
            <button className='bg-white px-10 py-3 rounded-lg border border-gray-300 hover:scale-102 active:scale-95 transition cursor-pointer'>Watch demo</button>
       </div>
       <div className='flex items-center gap-4 mt-8 mx-auto text-gray-600'>
            Trusted by 10k+ people
       </div>
    </div>
  )
}

export default Hero
