import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const SupabaseStatus: React.FC = () => {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [sessionCount, setSessionCount] = useState<number>(0);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('count', { count: 'exact', head: true });
        
        if (error) {
          console.log('Supabase error:', error.message);
          setStatus('disconnected');
        } else {
          console.log('✅ Supabase connected successfully!');
          setStatus('connected');
          setSessionCount(data?.length || 0);
        }
      } catch (e) {
        console.log('Supabase not available, using localStorage fallback');
        setStatus('disconnected');
      }
    };

    checkConnection();

    // Test real-time connection
    const channel = supabase
      .channel('connection-test')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'sessions' }, 
        (payload) => {
          console.log('📡 Real-time update received:', payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (status === 'connecting') {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
          <span className="text-sm">Conectando Supabase...</span>
        </div>
      </div>
    );
  }

  if (status === 'connected') {
    return (
      <div className="fixed bottom-4 right-4 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="text-sm">📊 Supabase conectado</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-500 text-white px-3 py-2 rounded-lg shadow-lg">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
        <span className="text-sm">💾 Modo local</span>
      </div>
    </div>
  );
};

export default SupabaseStatus;