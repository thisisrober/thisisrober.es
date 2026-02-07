import { Modal } from 'react-bootstrap';

export default function NewsletterModal({ show, onClose, success, title, text }) {
  return (
    <Modal show={show} onHide={onClose} centered className="newsletter-modal">
      <Modal.Body className="text-center p-4">
        <div className={`modal-icon-circle mx-auto mb-3 ${success ? 'success' : 'error'}`}>
          {success ? '✓' : '✕'}
        </div>
        <h4 className="fw-bold mb-2">{title}</h4>
        {text && <p className="text-muted">{text}</p>}
        <button className="btn btn-sm btn-outline-secondary mt-2" onClick={onClose}>OK</button>
      </Modal.Body>
    </Modal>
  );
}
