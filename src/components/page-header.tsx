type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-acv-clay">{eyebrow}</p>
      ) : null}
      <h1 className="mt-3 max-w-4xl text-3xl font-semibold text-acv-ink sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">{description}</p>
    </header>
  );
}
