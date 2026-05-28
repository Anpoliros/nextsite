import { layoutConfig } from "@/config/layout";

export default function PageShell({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div
      className="md:grid gap-8 h-full w-full"
      style={{ gridTemplateColumns: layoutConfig.gridTemplateColumns }}
    >
      <section className="w-full flex-grow">{children}</section>
      <aside className="hidden md:block border-l border-gray-100 dark:border-gray-800 pl-8 h-full min-h-[500px]">
        {right}
      </aside>
    </div>
  );
}
