import Link from 'next/link';
import HeaderAuth from '@/shared/components/HeaderAuth';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-between">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Link href={'/'}>MSPByte</Link>
          </div>
          <HeaderAuth />
        </div>
      </nav>
      <div className="flex flex-col p-4 overflow-x-hidden">{children}</div>
      <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs py-8">
        <p>
          Powered by{' '}
          <a
            href="https://supabase.com/"
            target="_blank"
            className="font-bold hover:underline"
            rel="noreferrer"
          >
            Supabase
          </a>
        </p>
      </footer>
    </div>
  );
}
