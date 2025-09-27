import React, { ReactNode } from "react";

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  closable?: boolean;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "lg",
  closable = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={closable ? onClose : undefined}>
      <div
        className={`modal-content modal-wrapper-${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          {closable && (
            <button
              className="modal-close-button"
              onClick={onClose}
              type="button"
            >
              ×
            </button>
          )}
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export default ModalWrapper;
