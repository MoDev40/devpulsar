
import React, { useState } from 'react';
import { Note } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomButton } from '@/components/ui/custom-button';
import { Edit, Trash2 } from 'lucide-react';
import { useNoteStore } from '@/store/noteStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import NoteForm from './NoteForm';

interface NoteItemProps {
  note: Note;
}

const NoteItem: React.FC<NoteItemProps> = ({ note }) => {
  const { deleteNote } = useNoteStore();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = async () => {
    await deleteNote(note.id);
    setShowDeleteDialog(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleEditClose = () => {
    setIsEditing(false);
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{note.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow pb-2">
          <p className="text-sm whitespace-pre-line break-words">{note.content}</p>
        </CardContent>
        <CardFooter className="pt-0 flex justify-between items-center text-xs text-muted-foreground">
          <span>
            {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
          </span>
          <div className="flex space-x-2">
            <CustomButton
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleEdit}
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </CustomButton>
            <CustomButton
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </CustomButton>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this note?</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <CustomButton variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </CustomButton>
            <CustomButton variant="destructive" onClick={handleDelete}>
              Delete
            </CustomButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isEditing && (
        <NoteForm onClose={handleEditClose} noteToEdit={note} />
      )}
    </>
  );
};

export default NoteItem;
