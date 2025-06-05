type Props = {
  name: string;
  errors?: Record<string, string[]>;
};

export default function FormError(props: Props) {
  if (!props.errors) return;

  const formatErrors = () => {
    if (!props.errors || !props.errors[props.name]) return "";
    return props.errors[props.name].join("\n");
  };

  return (
    <span className="text-red-500">
      {formatErrors()}
    </span>
  );
}