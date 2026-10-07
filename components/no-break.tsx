import { Fragment, type ReactNode } from 'react';

/** Names that must never wrap mid-word, hyphens included. */
const UNBREAKABLE = /(Make-A-Wish)/g;

/** Text with unbreakable names kept on one line. */
export function NoBreak({ children }: { children: string }): ReactNode {
  return children.split(UNBREAKABLE).map((part, index) =>
    index % 2 === 1 ? (
      <span key={index} className="whitespace-nowrap">
        {part}
      </span>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}
