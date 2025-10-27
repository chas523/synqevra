export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col gap-3">
      <div className="w-full h-16 bg-black text-white flex items-center pl-6 text-2xl rounded-xl">
        Manage Users
      </div>
      {children}
    </div>
  );
}
