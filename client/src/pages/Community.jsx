import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth, useUser } from '@clerk/clerk-react';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Community = () => {
  const [creations, setCreations] = useState([]);
  const { getToken } = useAuth();
  const { user } = useUser();

  const fetchCreations = async () => {
    try {
      const { data } = await axios.get('/api/user/get-published-creations', {
        headers: {
          Authorization: `Bearer ${await getToken()}`
        }
      });

      if (data.success) {
        setCreations(data.creations);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCreations();
    }
  }, [user]);

  return (
    <div className="h-full w-full p-6 text-slate-700 overflow-y-auto">
      <h2 className="text-xl font-semibold">Published Creations</h2>
      <p className="text-sm text-gray-500 mt-1 mb-4">
        Explore your AI-generated published creations!
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {creations.map((creation) => (
          <div
            key={creation.id}
            className="relative rounded-lg overflow-hidden shadow-sm border border-gray-200"
          >
            <img
              src={creation.content}
              alt={creation.prompt}
              className="w-full h-64 object-cover"
            />

            <div className="absolute bottom-0 w-full bg-black/70 text-white p-3">
              <p className="text-xs line-clamp-2">{creation.prompt}</p>
              <div className="text-xs text-gray-300 mt-1">Published</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Community;
