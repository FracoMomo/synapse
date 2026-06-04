import { useEffect, useState, useCallback } from 'react';
import { supabase, Lobby } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

export const useLobbies = () => {
  const { user } = useAuth();
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLobbies = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Fetch active lobbies with host profile info
    const { data, error } = await supabase
      .from('lobbies')
      .select(`
        *,
        host:profiles(id, full_name, avatar_url)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // If logged in, check which lobbies this user has joined
    if (user && data) {
      const { data: memberData } = await supabase
        .from('lobby_members')
        .select('lobby_id')
        .eq('student_id', user.id);

      const joinedIds = new Set((memberData || []).map(m => m.lobby_id));
      const lobbiesWithJoined = data.map(l => ({
        ...l,
        has_joined: joinedIds.has(l.id),
      }));
      setLobbies(lobbiesWithJoined);
    } else {
      setLobbies(data || []);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchLobbies();

    // Real-time subscription — updates feed live when anyone joins/creates a lobby
    const channel = supabase
      .channel('lobbies-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lobbies' }, fetchLobbies)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lobby_members' }, fetchLobbies)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchLobbies]);

  const joinLobby = async (lobbyId: string) => {
    if (!user) return { error: 'Not logged in' };

    const { error } = await supabase
      .from('lobby_members')
      .insert({ lobby_id: lobbyId, student_id: user.id });

    if (!error) {
      // Increment joined_count
      await supabase.rpc('increment_joined_count', { lobby_id_input: lobbyId });
    }

    return { error: error?.message ?? null };
  };

  const leaveLobby = async (lobbyId: string) => {
    if (!user) return { error: 'Not logged in' };

    const { error } = await supabase
      .from('lobby_members')
      .delete()
      .eq('lobby_id', lobbyId)
      .eq('student_id', user.id);

    if (!error) {
      await supabase.rpc('decrement_joined_count', { lobby_id_input: lobbyId });
    }

    return { error: error?.message ?? null };
  };

  const createLobby = async (params: {
    title: string;
    type: string;
    venue: string;
    lobby_time: string;
    capacity: number;
    year_level_filter?: string;
  }) => {
    if (!user) return { error: 'Not logged in', data: null };

    const { data, error } = await supabase
      .from('lobbies')
      .insert({ ...params, host_id: user.id })
      .select()
      .single();

    return { data, error: error?.message ?? null };
  };

  return { lobbies, loading, error, fetchLobbies, joinLobby, leaveLobby, createLobby };
};
