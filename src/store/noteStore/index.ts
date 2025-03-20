
import { create } from 'zustand';
import { createNote, deleteNote, fetchNotes, updateNote } from '@/api/noteApi';
import { Note } from '@/types';
import { useAuthStore } from '../authStore';

interface NoteState {
  notes: Note[];
  loading: boolean;
  error: string | null;
}

interface NoteStore extends NoteState {
  loadNotes: () => Promise<void>;
  addNote: (title: string, content: string) => Promise<void>;
  updateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

export const useNoteStore = create<NoteStore>((set, get) => ({
  notes: [],
  loading: false,
  error: null,

  loadNotes: async () => {
    try {
      set({ loading: true, error: null });
      const userId = useAuthStore.getState().user?.id;
      const notes = await fetchNotes(userId);
      set({ notes, loading: false });
    } catch (error) {
      console.error('Error loading notes:', error);
      set({ error: 'Failed to load notes', loading: false });
    }
  },

  addNote: async (title: string, content: string) => {
    try {
      const userId = useAuthStore.getState().user?.id;
      const note = await createNote(userId, title, content);
      if (note) {
        set((state) => ({
          notes: [note, ...state.notes],
        }));
      }
    } catch (error) {
      console.error('Error adding note:', error);
      set({ error: 'Failed to add note' });
    }
  },

  updateNote: async (id: string, updates) => {
    try {
      const success = await updateNote(id, updates);
      if (success) {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, ...updates, updatedAt: new Date() }
              : note
          ),
        }));
      }
    } catch (error) {
      console.error('Error updating note:', error);
      set({ error: 'Failed to update note' });
    }
  },

  deleteNote: async (id: string) => {
    try {
      const success = await deleteNote(id);
      if (success) {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }));
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      set({ error: 'Failed to delete note' });
    }
  },
}));
