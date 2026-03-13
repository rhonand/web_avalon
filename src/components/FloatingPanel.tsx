type FloatingPanelProps = {
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  onMinimize: () => void;
  onRestore: () => void;
  onClose?: () => void;
  children: React.ReactNode;
};