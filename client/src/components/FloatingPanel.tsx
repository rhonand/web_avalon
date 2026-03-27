import type { ReactNode } from "react";

type FloatingPanelProps = {
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  onMinimize: () => void;
  onRestore: () => void;
  onClose?: () => void;
  children: ReactNode;
};

export default function FloatingPanel({
  title,
  isOpen,
  isMinimized,
  onMinimize,
  onRestore,
  onClose,
  children,
}: FloatingPanelProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <section aria-label={title}>
      <div>
        <strong>{title}</strong>
      </div>
      <div>{children}</div>
      <div>
        {isMinimized ? (
          <button onClick={onRestore}>Restore</button>
        ) : (
          <button onClick={onMinimize}>Minimize</button>
        )}
        {onClose ? <button onClick={onClose}>Close</button> : null}
      </div>
    </section>
  );
}
