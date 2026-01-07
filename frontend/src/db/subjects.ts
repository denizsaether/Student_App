import { supabase } from "../supabaseClient";

export async function fetchSubjects() {
  const { data, error } = await supabase
    .from("subjects")
    .select("id, name, weekly_goal, is_archived, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Kunne ikke hente fag:", error.message);
    return [];
  }

  // Map DB -> appens Subject-format
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    weeklyGoal: row.weekly_goal,
    isArchived: row.is_archived,
  }));
}




export async function createSubject(userId: string, name: string, weeklyGoal: number) {
  const { data, error } = await supabase
    .from("subjects")
    .insert([
      {
        user_id: userId,
        name,
        weekly_goal: weeklyGoal,
        is_archived: false,
      },
    ])
    .select("id, name, weekly_goal, is_archived")
    .single();

  if (error) {
    console.error("Kunne ikke lage fag:", error.message);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    weeklyGoal: data.weekly_goal,
    isArchived: data.is_archived,
  };
}


export async function setSubjectArchived(subjectId: number, isArchived: boolean) {
  const { data, error } = await supabase
    .from("subjects")
    .update({ is_archived: isArchived })
    .eq("id", subjectId)
    .select("id, name, weekly_goal, is_archived")
    .single();

  if (error) {
    console.error("Kunne ikke oppdatere arkiv-status:", error.message);
    return null;
  }

  // Map DB -> appens Subject-format
  return {
    id: data.id,
    name: data.name,
    weeklyGoal: data.weekly_goal,
    isArchived: data.is_archived,
  };
}

export async function updateSubject(subjectId: number, name: string, weeklyGoal: number) {
  const { data, error } = await supabase
    .from("subjects")
    .update({ name, weekly_goal: weeklyGoal })
    .eq("id", subjectId)
    .select("id, name, weekly_goal, is_archived")
    .single();

  if (error) {
    console.error("Kunne ikke oppdatere fag:", error.message);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    weeklyGoal: data.weekly_goal,
    isArchived: data.is_archived,
  };
}


export async function deleteSubject(subjectId: number): Promise<boolean> {
  const { error } = await supabase.from("subjects").delete().eq("id", subjectId);

  if (error) {
    console.error("Kunne ikke slette fag:", error.message);
    return false;
  }

  return true;
}


