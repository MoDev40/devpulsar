
import React from 'react';
import { useForm } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CustomButton } from '@/components/ui/custom-button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Note } from '@/types';
import { useNoteStore } from '@/store/noteStore';
import { X } from 'lucide-react';

interface NoteFormProps {
  onClose: () => void;
  noteToEdit?: Note;
}

interface FormValues {
  title: string;
  content: string;
}

const NoteForm: React.FC<NoteFormProps> = ({ onClose, noteToEdit }) => {
  const { addNote, updateNote } = useNoteStore();
  const isEditing = !!noteToEdit;

  const form = useForm<FormValues>({
    defaultValues: {
      title: noteToEdit?.title || '',
      content: noteToEdit?.content || '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (isEditing && noteToEdit) {
      await updateNote(noteToEdit.id, {
        title: data.title,
        content: data.content,
      });
    } else {
      await addNote(data.title, data.content);
    }
    onClose();
  };

  return (
    <Card className="p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">{isEditing ? 'Edit Note' : 'Add New Note'}</h3>
        <CustomButton
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </CustomButton>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Note title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Write your note here..." 
                    className="min-h-[120px]" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2">
            <CustomButton type="button" variant="outline" onClick={onClose}>
              Cancel
            </CustomButton>
            <CustomButton type="submit">
              {isEditing ? 'Update' : 'Save'}
            </CustomButton>
          </div>
        </form>
      </Form>
    </Card>
  );
};

export default NoteForm;
