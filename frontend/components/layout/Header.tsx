interface HeaderProps { title: string; subtitle?: string; action?: React.ReactNode; }

export function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        {title && <h1 className="text-xl font-bold text-neutral-800 tracking-tight">{title}</h1>}
        {subtitle && <p className="text-[12px] mt-0.5 text-neutral-400">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
