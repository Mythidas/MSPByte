type Props = {
  lead?: React.ReactNode;
  children: React.ReactNode;
};

export default function Display({ lead, children }: Props) {
  return (
    <div className="flex items-center gap-2 p-2 rounded border bg-card">
      {lead && <span className="h-4 w-4 text-muted-foreground">{lead}</span>}
      <span className="flex select-text text-sm font-medium space-x-2 justify-center items-center">
        {children}
      </span>
    </div>
  );
}
