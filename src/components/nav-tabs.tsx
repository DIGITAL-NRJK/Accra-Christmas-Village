import Link from "next/link";

export type NavItem = {
  href: string;
  label: string;
};

type NavTabsProps = {
  items: NavItem[];
  activeHref?: string;
};

export function NavTabs({ items, activeHref }: NavTabsProps) {
  return (
    <nav className="mx-auto flex w-full max-w-6xl gap-2 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-8">
      {items.map((item) => {
        const active = item.href === activeHref;

        return (
          <Link
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
              active
                ? "border-acv-palm bg-acv-palm text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-acv-gold hover:text-acv-ink"
            }`}
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
