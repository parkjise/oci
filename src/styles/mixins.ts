import { css } from "styled-components";

export const flex = (
  align: string = "center",
  justify: string = "center",
  direction: "row" | "column" = "row",
  gap?: string
) => css`
  display: flex;
  flex-direction: ${direction};
  align-items: ${align};
  justify-content: ${justify};
  ${gap ? `gap:${gap};` : ""}
`;

export const flexCenter = () => flex("center", "center");
export const flexBetween = () => flex("center", "betten");

type GridOptions = {
  columns?: string;
  rows?: string;
  gap?: string;
  columnGap?: string;
  rowGap?: string;
  alignItems?: string;
  justifyItems?: string;
};

export const grid = (options: GridOptions | string = {}) => {
  const normalized: GridOptions =
    typeof options === "string" ? { columns: options } : options;

  const {
    columns = "1fr",
    rows,
    gap,
    columnGap,
    rowGap,
    alignItems,
    justifyItems,
  } = normalized;

  return css`
    display: grid;
    grid-template-columns: ${columns};
    ${rows ? `grid-template-rows: ${rows};` : ""}
    ${gap ? `gap: ${gap};` : ""}
    ${columnGap ? `column-gap: ${columnGap};` : ""}
    ${rowGap ? `row-gap: ${rowGap};` : ""}
    ${alignItems ? `align-items: ${alignItems};` : ""}
    ${justifyItems ? `justify-items: ${justifyItems};` : ""}
  `;
};

export const Card = (padding: string = "15px", radius: string = "8px") => css`
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
  border-radius: ${radius};
  padding: ${padding};
`;

export const BoxShadow = (value: string) => css`
  box-shadow: ${value};
`;

export const scrollbar = () => css`
  overflow-y: auto;
  scrollbar-gutter: stable;
  scrollbar-width: thin; /* auto | thin | none */
  scrollbar-color: transparent transparent;

  &:hover {
    scrollbar-color: rgba(0, 0, 0, 0.25) transparent;
  }

  &::-webkit-scrollbar {
    width: 2px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background-color: transparent;
  }

  &:hover::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.25);
  }

  &:hover::-webkit-scrollbar-track {
    background-color: rgba(0, 0, 0, 0.04);
  }
`;
