type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 h-2 w-full max-w-xl acv-route-band" />
      {eyebrow ? (
        <p className="acv-eyebrow">{eyebrow}</p>
      ) : null}
      <h1 className="mt-3 max-w-4xl font-display text-5xl uppercase leading-none text-acv-ink sm:text-7xl">
        {title}
      </h1>
      <p className="mt-5 max-w-3xl text-base leading-7 text-slate-700 sm:text-lg">{description}</p>
    </header>
  );
}
