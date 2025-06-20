import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';

type Props = {
  open?: boolean;
  errors?: Record<string, string[]>;
  message?: string;
  onClose?: () => void;
};

export default function FormAlert({ errors, message, onClose }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (errors || message) {
      setOpen(true);
    }
  }, [errors, message]);

  const handleClose = () => {
    setOpen(false);
    onClose && onClose();
  };

  const pascalCase = (s: string) => {
    return s.substring(0, 1).toUpperCase() + s.substring(1);
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{message ? 'Message' : 'Errors'}</AlertDialogTitle>
          <AlertDialogDescription className="flex flex-col gap-2">
            {message && message}
            {errors &&
              !message &&
              Object.entries(errors).map(([field, error]) => (
                <span key={field}>{`${pascalCase(field)}: ${error}`}</span>
              ))}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Separator />
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleClose}>Acknowledge</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
