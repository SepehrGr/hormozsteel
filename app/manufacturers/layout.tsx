export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col w-full overflow-hidden">
      {children}
    </section>
  );
}
