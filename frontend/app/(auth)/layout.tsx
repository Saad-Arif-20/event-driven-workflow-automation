export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #f3ede4 0%, #fef9e7 40%, #f7f0e0 100%)" }}>
      {/* Warm decorative circles */}
      <div className="absolute top-[-10%] right-[15%] w-[400px] h-[400px] rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, #f5cb4c, transparent 70%)" }} />
      <div className="absolute bottom-[-15%] left-[5%] w-[350px] h-[350px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #e8b830, transparent 70%)" }} />
      <div className="relative z-10 w-full max-w-md px-4">
        {children}
      </div>
    </div>
  );
}
