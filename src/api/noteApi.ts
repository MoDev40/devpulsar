
import { supabase } from '@/integrations/supabase/client';
import { Note } from '@/types';
import { toast } from 'sonner';

export async function fetchNotes(userId: string | undefined) {
  if (!userId) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform to match our Note type
    const transformedNotes: Note[] = data.map(note => ({
      id: note.id,
      title: note.title,
      content: note.content || '',
      createdAt: new Date(note.created_at),
      updatedAt: new Date(note.updated_at),
    }));

    return transformedNotes;
  } catch (error) {
    console.error('Error fetching notes:', error);
    toast.error('Failed to load your notes');
    return [];
  }
}

export async function createNote(
  userId: string | undefined, 
  title: string, 
  content: string
) {
  if (!userId) {
    toast.error('Please log in to add notes');
    return null;
  }

  try {
    const now = new Date();
    const { data, error } = await supabase.from('notes').insert({
      user_id: userId,
      title,
      content,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    }).select('*').single();

    if (error) throw error;
    
    toast.success('Note added successfully');
    
    return {
      id: data.id,
      title: data.title,
      content: data.content || '',
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  } catch (error) {
    console.error('Error adding note:', error);
    toast.error('Failed to save your note');
    return null;
  }
}

export async function updateNote(
  id: string,
  updates: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>
) {
  try {
    const now = new Date();
    const { error } = await supabase
      .from('notes')
      .update({
        ...updates,
        updated_at: now.toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
    toast.success('Note updated');
    return true;
  } catch (error) {
    console.error('Error updating note:', error);
    toast.error('Failed to update note');
    return false;
  }
}

export async function deleteNote(id: string) {
  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    toast.success('Note deleted');
    return true;
  } catch (error) {
    console.error('Error deleting note:', error);
    toast.error('Failed to delete note');
    return false;
  }
}
