import { twMerge } from "tailwind-merge";

export function H1({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <h1
      className={twMerge(
        "lg:text-4xl text-xl text-red font-heading",
        className,
      )}
    >
      {children}
    </h1>
  );
}
