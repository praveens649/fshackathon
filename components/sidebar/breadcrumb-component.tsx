import * as React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb"
import { BreadcrumbItems } from "../ui/types"
import { usePathname } from "next/navigation";

const findBreadcrumbPath = (
  items: BreadcrumbItems["items"],
  currentRoute: string,
) => {
  for (const key in items) {
    if (key === currentRoute) return items[key]!;
  }
  return [];
};

export function BreadcrumbComponent({ items }: BreadcrumbItems) {
  const currentRoute = usePathname();
  const breadcrumbPath = React.useMemo(
    () => findBreadcrumbPath(items, currentRoute),
    [items, currentRoute],
  );

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbPath.map((item, index) => (
          <React.Fragment key={item.url}>
            <BreadcrumbItem
              className={
                index === breadcrumbPath.length - 1 ? "" : "hidden md:block"
              }
            >
              {index === breadcrumbPath.length - 1 ? (
                <BreadcrumbPage>{item.title}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.url}>{item.title}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbPath.length - 1 && (
              <BreadcrumbSeparator className="hidden md:block" />
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
