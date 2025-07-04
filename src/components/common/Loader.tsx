import { Spinner } from '@/components/common/Spinner';

export default function Loader() {
  return (
    <div className="flex flex-col w-full h-full justify-center items-center">
      <Spinner size={48} />
    </div>
  );
}
