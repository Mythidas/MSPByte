import { cn } from '@/lib/utils';
import Link from 'next/link';

type Props = {
  children: React.ReactNode;
  lead?: React.ReactNode;
} & React.ComponentProps<'a'>;

export default function Display({ lead, className, children, href = '', ...props }: Props) {
  if (!href) {
    return (
      <div className={cn('flex items-center w-full gap-2 p-2 rounded border bg-card', className)}>
        {lead && <span className="h-4 w-4 text-muted-foreground">{lead}</span>}
        <span className="flex w-full select-text text-sm font-medium space-x-2 justify-start items-center">
          {children}
        </span>
      </div>
    );
  }

  return (
    <Link
      className={cn(
        'flex items-center w-full gap-2 p-2 rounded border bg-card',
        'hover:bg-input/30 hover:cursor-pointer'
      )}
      {...props}
      href={href}
    >
      {lead && <span className="h-4 w-4 text-muted-foreground">{lead}</span>}
      <span
        className={cn(
          'flex w-full select-text text-sm font-medium space-x-2 justify-start items-center',
          className
        )}
      >
        {children}
      </span>
    </Link>
  );
}
