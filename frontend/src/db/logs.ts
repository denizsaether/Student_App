import { supabase } from "../supabaseClient";

export type CreatedLog = {
  id: number;
  subjectId: number;
  durationMinutes: number;
  createdAt: string;
};

export async function createLog(
  userId: string,
  subjectId: number,
  durationMinutes: number
): Promise<CreatedLog | null> {
  const { data, error } = await supabase
    .from("logs")
    .insert([
      {
        user_id: userId,
        subject_id: subjectId,
        duration_minutes: durationMinutes,
      },
    ])
    .select("id, subject_id, duration_minutes, created_at")
    .single();

  if (error) {
    console.error("Kunne ikke lage logg:", error.message);
    return null;
  }

  return {
    id: data.id,
    subjectId: data.subject_id,
    durationMinutes: data.duration_minutes,
    createdAt: data.created_at,
  };
}


export async function fetchLogs() {
  const { data, error } = await supabase
    .from("logs")
    .select("id, subject_id, duration_minutes, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Kunne ikke hente logs:", error.message);
    return [];
  }

  // Map DB -> appens LogEntry-format
  return data.map((row) => {
    const d = new Date(row.created_at);
    return {
      id: row.id,
      subjectId: row.subject_id,
      durationMinutes: row.duration_minutes,
      createdAtISO: row.created_at,
      createdAt: d.toLocaleString(),
    };
  });
}


export async function deleteLog(logId: number): Promise<boolean> {
  const { error } = await supabase.from("logs").delete().eq("id", logId);

  if (error) {
    console.error("Kunne ikke slette logg:", error.message);
    return false;
  }

  return true;
}


export async function updateLogDuration(
  logId: number,
  durationMinutes: number
): Promise<{ id: number; durationMinutes: number; createdAt: string } | null> {
  const { data, error } = await supabase
    .from("logs")
    .update({ duration_minutes: durationMinutes })
    .eq("id", logId)
    .select("id, duration_minutes, created_at")
    .single();

  if (error) {
    console.error("Kunne ikke oppdatere logg:", error.message);
    return null;
  }

  return {
    id: data.id,
    durationMinutes: data.duration_minutes,
    createdAt: data.created_at,
  };
}

