import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import React, { useRef } from "react";
import { IconType } from "react-icons";
import { BsCodeSlash } from "react-icons/bs";
import { MdMoveUp } from "react-icons/md";
import { BiChevronRight } from "react-icons/bi";
import useFloatingAnchor from "../../lib/hooks/useFloatingAnchor";

interface MenuItem {
  icon?: IconType;
  label: string;
  onSelect?: () => void;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    icon: BsCodeSlash,
    label: "Edit innerHTML",
    onSelect: () => {
      console.log("edit innerHTML");
    },
  },
  {
    icon: MdMoveUp,
    label: "Rearrange",
    onSelect: () => {
      console.log("rearrange");
    },
  },
  {
    label: "Select parent",
    children: [
      {
        label: "div",
        onSelect: () => {
          console.log("select parent div");
        },
      },
      {
        label: "div",
        onSelect: () => {
          console.log("select parent div");
        },
      },
    ],
  },
];

interface EditElementMenuProps {
  selectedElement: Element | null;
}

const EditElementMenuItems = ({ items }: { items: MenuItem[] }) => {
  return (
    <>
      {items.map(({ icon: Icon, label, onSelect, children }, i) => {
        // managing sub menu open state is a workaround for an apparent bug in
        // either radix or this implementation, not sure which
        const [open, setOpen] = React.useState(false);

        const subMenuContainer = !!children?.length ? useRef(null) : null;
        return !!children?.length ? (
          <DropdownMenu.Sub
            key={i}
            onOpenChange={(open) => console.log("sub on open change", open)}
            open={open}
          >
            <DropdownMenu.SubTrigger
              asChild
              ref={subMenuContainer}
              onPointerEnter={() => setOpen(true)}
              onPointerLeave={() => setOpen(false)}
            >
              <div className="gb-flex gb-justify-between gb-text-gray-700 gb-bg-white gb-py-2 gb-px-4 gb-cursor-pointer">
                <div>
                  {Icon && <Icon className="gb-mr-2" />}
                  {label}
                </div>
                <BiChevronRight className="gb-h-4 gb-w-4" />
              </div>
            </DropdownMenu.SubTrigger>
            <DropdownMenu.Portal container={subMenuContainer?.current}>
              <DropdownMenu.SubContent
                onPointerEnter={() => setOpen(true)}
                onPointerLeave={() => setOpen(false)}
              >
                <div
                  className="gb-relative gb-bg-white gb-rounded gb-shadow gb-overflow-hidden gb-text-sm"
                  style={{ minWidth: "12rem" }}
                >
                  <EditElementMenuItems items={children} />
                </div>
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>
        ) : (
          <DropdownMenu.Item key={i} onSelect={onSelect}>
            <div className="gb-flex gb-text-gray-700 gb-bg-white  gb-py-2 gb-px-4 gb-cursor-pointer">
              {Icon && <Icon className="gb-mr-2" />}
              {label}
            </div>
          </DropdownMenu.Item>
        );
      })}
    </>
  );
};

function EditElementMenu({ selectedElement }: EditElementMenuProps) {
  return (
    <div
      className="gb-relative gb-bg-white gb-rounded gb-shadow gb-overflow-hidden gb-text-sm"
      style={{ minWidth: "12rem" }}
    >
      <div className="gb-text-white gb-bg-gray-700 gb-py-2 gb-px-4">
        {selectedElement?.tagName}
      </div>
      <EditElementMenuItems items={menuItems} />
    </div>
  );
}

function EditElementMenuMount(props: EditElementMenuProps) {
  const { selectedElement } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const domRect = useFloatingAnchor(selectedElement);

  if (!domRect) return null;

  const { top, left, width, height } = domRect;

  return (
    <DropdownMenu.Root defaultOpen open={!!selectedElement} modal={false}>
      <DropdownMenu.Trigger asChild>
        <div
          ref={containerRef}
          className="gb-z-max"
          style={{
            position: "fixed",
            top,
            left,
            width,
            height,
          }}
        />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal container={containerRef.current}>
        <DropdownMenu.Content side="right" sideOffset={8} align="start">
          <EditElementMenu {...props} />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export default EditElementMenuMount;
