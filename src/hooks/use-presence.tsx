import { useCallback, useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface PresenceData {
  [key: string]: unknown;
}

const HEARTBEAT_PERIOD = 5000;

const usePresence = (room: string, user: string, initialData: PresenceData) => {
  const [data, setData] = useState<PresenceData>(initialData);
  let presence = useQuery(api.functions.presence.list, { room });
  
  if (presence) {
    presence = presence.filter((p) => p.user !== user);
  }
  
  const updatePresence = useMutation(api.functions.presence.update);
  const heartbeat = useMutation(api.functions.presence.heartbeat);

  useEffect(() => {
    void updatePresence({ room, user, data });
    const intervalId = setInterval(() => {
      void heartbeat({ room, user });
    }, HEARTBEAT_PERIOD);
    
    return () => clearInterval(intervalId);
  }, [updatePresence, heartbeat, room, user, data]);

  const updateData = useCallback((patch: Partial<PresenceData>) => {
    setData((prevState) => ({
      ...prevState,
      ...patch,
    }));
  }, []);

  return [data, presence, updateData] as [PresenceData, unknown, (patch: Partial<PresenceData>) => void];
};

export const isOnline = (presence: { updated: number }) => {
  return Date.now() - presence.updated < 10000;
};

// Export the hook
export default usePresence;
