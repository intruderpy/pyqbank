import Link from "next/link";
import { SITE_URL } from "@/lib/config";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface Props {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: Props) {
  // Generate JSON-LD BreadcrumbList
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href ? `${SITE_URL}${item.href}` : undefined,
    })),
  };

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Visual Breadcrumb */}
      <div className="breadcrumb">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <span key={index} style={{ display: "inline-flex", alignItems: "center" }}>
              {isLast || !item.href ? (
                <span>{item.label}</span>
              ) : (
                <Link href={item.href}>{item.label}</Link>
              )}
              {!isLast && <span style={{ margin: "0 8px", color: "var(--text-muted)" }}>›</span>}
            </span>
          );
        })}
      </div>
    </>
  );
}
