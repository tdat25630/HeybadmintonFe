export default function Modal({ open, title, onClose, children, footer }) {
    if (!open) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={(event) => event.stopPropagation()}>
                <div className="modal-header">
                    <h3 style={{ margin: 0 }}>{title}</h3>
                    <button type="button" className="icon-button" onClick={onClose} aria-label="Đóng">
                        ✕
                    </button>
                </div>

                <div className="modal-body">{children}</div>

                {footer ? <div className="modal-footer">{footer}</div> : null}
            </div>
        </div>
    );
}
