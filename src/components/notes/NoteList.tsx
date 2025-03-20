
import React, { useState, useEffect } from 'react';
import { useNoteStore } from '@/store/noteStore';
import { useAuthStore } from '@/store/authStore';
import { CustomButton } from '@/components/ui/custom-button';
import { Plus } from 'lucide-react';
import NoteItem from './NoteItem';
import NoteForm from './NoteForm';

const NoteList: React.FC = () => {
  const { user } = useAuthStore();
  const { notes, loadNotes, loading } = useNoteStore();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [user, loadNotes]);

  const handleAddClick = () => {
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 pb-16 animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-medium">Notes</h2>
        <CustomButton
          onClick={handleAddClick}
          className="flex items-center"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Note
        </CustomButton>
      </div>

      {showForm && <NoteForm onClose={handleFormClose} />}

      {loading ? (
        <div className="text-center py-8">Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No notes yet. Click the "Add Note" button to create your first note.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {notes.map((note) => (
            <NoteItem key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
};

export default NoteList;
