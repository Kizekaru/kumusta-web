"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useRealtimeSubscription(
  table: string,
  event: "INSERT" | "UPDATE" | "DELETE" | "*",
  filter: string | undefined,
  callback: (payload: any) => void
) {
  useEffect(() => {
    let channelString = `public:${table}`;
    if (filter) {
      channelString += `:${filter}`;
    }
    const channel = supabase
      .channel(channelString)
      .on(
        "postgres_changes",
        { event, schema: "public", table },
        (payload) => callback(payload)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, event, filter, callback]);
}
