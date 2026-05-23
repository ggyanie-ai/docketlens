"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";

type SlotProps = {
  children?: ReactNode;
  className?: string;
  [key: string]: unknown;
};

export function Slot({ children, ...props }: SlotProps) {
  if (!isValidElement(children)) return null;
  const child = children as ReactElement<Record<string, unknown> & { ref?: Ref<unknown> }>;
  const childProps = child.props as Record<string, unknown>;
  return cloneElement(child, {
    ...props,
    ...childProps,
    className: [props.className, childProps.className]
      .filter(Boolean)
      .join(" "),
  });
}

export function asArray<T>(c: T | T[]): T[] {
  return Children.toArray(c as ReactNode) as unknown as T[];
}
