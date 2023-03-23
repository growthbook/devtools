import React, { FC, useMemo } from "react";

const getBreadcrumbs = (element: HTMLElement) => {
  const breadcrumbs = [];
  let currentElement: HTMLElement | null = element;
  while (currentElement) {
    breadcrumbs.unshift(currentElement);
    currentElement = currentElement.parentElement;
  }
  return breadcrumbs;
};

const BreadcrumbsView: FC<{
  element: HTMLElement;
  setElement: (element: HTMLElement) => void;
}> = ({ element, setElement }) => {
  const elementInnerHtml = element.innerHTML;
  const breadcrumbs = useMemo(() => getBreadcrumbs(element), [element]);
  const children = useMemo(
    () => Array.from(element.children),
    [element, elementInnerHtml]
  );

  const onChildSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      const index = parseInt(e.target.value);
      if (index < 0) return;
      setElement(children[index] as HTMLElement);
    } catch (e) {}
  };

  return (
    <div className="px-4 text-sm text-slate-200">
      {breadcrumbs.map((breadcrumb, index) => (
        <span key={index}>
          <span
            className="cursor-pointer hover:text-slate-100"
            onClick={() => setElement(breadcrumb)}
          >
            {breadcrumb.tagName.toLowerCase()}
          </span>
          {index < breadcrumbs.length - 1 && " > "}
        </span>
      ))}

      {children.length > 0 && (
        <span>
          {" > "}
          <span>
            <select value={-1} onChange={onChildSelect} className="text-black">
              <option value={-1}>MORE</option>
              {children.map((child, index) => (
                <option key={index} value={index}>
                  {child.tagName}
                </option>
              ))}
            </select>
          </span>
        </span>
      )}
    </div>
  );
};

export default BreadcrumbsView;
