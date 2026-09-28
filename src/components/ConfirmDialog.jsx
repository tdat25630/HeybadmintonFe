import Modal from './Modal';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Xóa', cancelLabel = 'Hủy', onConfirm, onCancel, loading = false }) {
    return (
        <Modal
            open={open}
            title={title}
            onClose={onCancel}
            footer={
                <>
                    <button type="button" className="secondary-button" onClick={onCancel} disabled={loading}>
                        {cancelLabel}
                    </button>
                    <button type="button" className="danger-button" onClick={onConfirm} disabled={loading}>
                        {loading ? 'Đang xử lý...' : confirmLabel}
                    </button>
                </>
            }
        >
            <p style={{ margin: 0, color: '#d9e5f7' }}>{message}</p>
        </Modal>
    );
}
