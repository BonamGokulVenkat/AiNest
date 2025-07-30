import { Menu, X } from 'lucide-react';
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar'; // <- Make sure this path is correct
import {SignIn,useUser} from '@clerk/clerk-react';

const Layout = () => {
  const navigate = useNavigate();
  const [sidebar, setSidebar] = useState(false);
  const {user}=useUser();
  return user?(
    <div className='flex flex-col items-start justify-start h-screen'>
      <nav className='w-full px-8 min-h-14 flex items-center justify-between border-b border-gray-200'>
        <img
          src='/logo.png'
          alt='AiNest Logo'
          className='w-30 ml-7 cursor-pointer'
          onClick={() => navigate('/')}
        />
        <div onClick={() => setSidebar(!sidebar)}>
          {sidebar ? (
            <X className='w-6 h-6 text-gray-600 sm:hidden' />
          ) : (
            <Menu className='w-6 h-6 text-gray-600 sm:hidden cursor-pointer' />
          )}
        </div>
      </nav>

      <div className='flex-1 w-full flex h-[calc(100vh-64px)] relative'>
        <Sidebar sidebar={sidebar} setSidebar={setSidebar} />
        <div className='flex-1 bg-[#F4F7FB] overflow-auto'>
          <Outlet />
        </div>
      </div>
    </div>
  ):(
    <div className='flex items-center justify-center h-screen'>
      <SignIn/>
    </div>
  )
};

export default Layout;
