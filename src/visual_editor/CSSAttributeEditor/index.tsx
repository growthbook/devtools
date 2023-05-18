import React, { FC, useEffect, useState } from "react";
import {
  BiAlignLeft,
  BiBold,
  BiBorderAll,
  BiBorderRadius,
  BiBrightnessHalf,
  BiColor,
  BiColorFill,
  BiFontFamily,
  BiFontSize,
  BiImage,
  BiImages,
  BiLayer,
  BiLayout,
  BiMove,
  BiText,
  BiVerticalCenter,
} from "react-icons/bi";
import { RiLineHeight, RiTextSpacing } from "react-icons/ri";
import {
  RxBorderStyle,
  RxBorderWidth,
  RxMargin,
  RxPadding,
} from "react-icons/rx";
import { VscBrowser, VscWhitespace } from "react-icons/vsc";
import { MdBorderColor } from "react-icons/md";
import { TbFloatCenter } from "react-icons/tb";
import styleToObject from "style-to-object";
import CSSTextInput from "./CSSTextInput";
import { IconType } from "react-icons";

interface CSSAttribute {
  name: string;
  icon: IconType;
  value: string;
  isInline: boolean;
}

interface AllAttributes {
  typography: CSSAttribute[];
  background: CSSAttribute[];
  border: CSSAttribute[];
  layout: CSSAttribute[];
}

const _typographyAttributes = [
  {
    name: "font-family",
    icon: BiFontFamily,
  },
  {
    name: "font-size",
    icon: BiFontSize,
  },
  {
    name: "font-weight",
    icon: BiBold,
  },
  {
    name: "text-align",
    icon: BiAlignLeft,
  },
  {
    name: "color",
    icon: BiColor,
  },
  {
    name: "text-decoration",
    icon: BiText,
  },
  {
    name: "line-height",
    icon: RiLineHeight,
  },
  {
    name: "word-spacing",
    icon: RiTextSpacing,
  },
  {
    name: "white-space",
    icon: VscWhitespace,
  },
];

const _backgroundAttributes = [
  {
    name: "background",
    icon: VscBrowser,
  },
  {
    name: "background-color",
    icon: BiColorFill,
  },
  {
    name: "background-image",
    icon: BiImage,
  },
  {
    name: "background-repeat",
    icon: BiImages,
  },
];

const _borderAttributes = [
  {
    name: "border",
    icon: BiBorderAll,
  },
  {
    name: "margin",
    icon: RxMargin,
  },
  {
    name: "padding",
    icon: RxPadding,
  },
  {
    name: "border-style",
    icon: RxBorderStyle,
  },
  {
    name: "border-width",
    icon: RxBorderWidth,
  },
  {
    name: "border-color",
    icon: MdBorderColor,
  },
  {
    name: "border-radius",
    icon: BiBorderRadius,
  },
];

const _layoutAttributes = [
  {
    name: "layout",
    icon: BiLayout,
  },
  {
    name: "float",
    icon: TbFloatCenter,
  },
  {
    name: "vertical-align",
    icon: BiVerticalCenter,
  },
  {
    name: "overflow",
    icon: BiMove,
  },
  {
    name: "opacity",
    icon: BiBrightnessHalf,
  },
  {
    name: "z-index",
    icon: BiLayer,
  },
];

const CSSAttributeEditor: FC<{ selectedElement: Element }> = ({
  selectedElement,
}) => {
  const elementStyle = selectedElement.getAttribute("style") ?? "";
  const [attributes, setAttributes] = useState<AllAttributes>({
    typography: [],
    background: [],
    border: [],
    layout: [],
  });

  // when the element's styles change, re-render CSS attributes
  useEffect(() => {
    if (!window) return;

    const computed = window.getComputedStyle(selectedElement);

    let inlineStyles: Record<string, string>;
    try {
      inlineStyles = styleToObject(elementStyle) ?? {};
    } catch (e) {
      console.error("Error parsing inline style", {
        selectedElement,
        error: e,
      });
      inlineStyles = {};
    }

    const getCSS = (attr: { name: string; icon: IconType }): CSSAttribute => ({
      ...attr,
      value: computed.getPropertyValue(attr.name),
      isInline: inlineStyles[attr.name] !== undefined,
    });

    const newAttributes: AllAttributes = {
      typography: _typographyAttributes.map(getCSS),
      background: _backgroundAttributes.map(getCSS),
      border: _borderAttributes.map(getCSS),
      layout: _layoutAttributes.map(getCSS),
    };

    setAttributes(newAttributes);
  }, [elementStyle]);

  const {
    typography: typographyAttributes,
    background: backgroundAttributes,
    border: borderAttributes,
    layout: layoutAttributes,
  } = attributes;

  return (
    <div className="gb-text-light gb-mx-4">
      <div className="gb-py-4 gb-text-xs">Typography</div>
      <div>
        {typographyAttributes.map((attr, i) => (
          <CSSTextInput key={i} {...attr} />
        ))}
      </div>
      <div className="gb-py-4 gb-text-xs">Background</div>
      <div>
        {backgroundAttributes.map((attr, i) => (
          <CSSTextInput key={i} {...attr} />
        ))}
      </div>
      <div className="gb-py-4 gb-text-xs">Border</div>
      <div>
        {borderAttributes.map((attr, i) => (
          <CSSTextInput key={i} {...attr} />
        ))}
      </div>
      <div className="gb-py-4 gb-text-xs">Layout</div>
      <div>
        {layoutAttributes.map((attr, i) => (
          <CSSTextInput key={i} {...attr} />
        ))}
      </div>
    </div>
  );
};

export default CSSAttributeEditor;
