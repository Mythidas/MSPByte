import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FormError from '@/components/common/FormError';
import RouteButton from '@/components/common/routed/RouteButton';
import { SubmitButton } from '@/components/common/SubmitButton';
import { Tables } from '@/db/schema';
import { useUser } from '@/lib/providers/UserContext';
import { putSite } from '@/services/sites';
import { zodResolver } from '@hookform/resolvers/zod';
import { HousePlus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

const formSchema = z.object({
  name: z.string(),
  isParent: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

type Props = {
  parentId?: string;
  onSuccess?: (site: Tables<'sites'>) => void;
};

export default function CreateSiteDialog({ parentId, onSuccess }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });
  const { user } = useUser();

  const onSubmit = async (data: FormData) => {
    try {
      const result = await putSite([
        {
          tenant_id: user!.tenant_id,
          parent_id: parentId,
          name: data.name,
          is_parent: data.isParent ? data.isParent === 'on' : false,
        },
      ]);

      if (!result.ok) {
        throw result.error.message;
      }

      if (onSuccess) onSuccess(result.data[0]);
      setIsOpen(false);
    } catch (err) {
      toast.error(`Failed to save site: ${err}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <RouteButton module="Sites" level="Write">
          <HousePlus className="h-4 w-4 mr-2" />
          Add Site
        </RouteButton>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <AlertDialogHeader>
            <AlertDialogTitle>Create Site</AlertDialogTitle>
          </AlertDialogHeader>

          <Label className="flex flex-col items-start">
            Name
            <Input placeholder="Enter name" {...register('name')} />
            <FormError name="name" errors={errors} />
          </Label>
          {!parentId && (
            <Label>
              <Checkbox {...register('isParent')} />
              Parent?
            </Label>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <SubmitButton pending={isSaving}>Create Site</SubmitButton>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
