import React, { useEffect, useState } from 'react';
import { X, UserPlus, Phone, User as UserIcon, Shield, Star, Trash2, Edit2, Check } from 'lucide-react';
import useContactStore from '../../../stores/contactStore';
import './EmergencyContactsModal.css';

const ContactForm = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    relationship: initialData?.relationship || 'Family',
    isPrimaryContact: initialData?.isPrimaryContact || false,
    isSOSContact: initialData?.isSOSContact ?? true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="ec-form" onSubmit={handleSubmit}>
      <div className="ec-form-row">
        <div className="ec-input-group">
          <UserIcon size={14} className="ec-input-icon" />
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="ec-input-group">
          <Phone size={14} className="ec-input-icon" />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      
      <div className="ec-form-row">
        <div className="ec-input-group">
          <select name="relationship" value={formData.relationship} onChange={handleChange}>
            <option value="Family">Family</option>
            <option value="Friend">Friend</option>
            <option value="Partner">Partner</option>
            <option value="Colleague">Colleague</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="ec-form-toggles">
        <label className="ec-toggle-label">
          <input
            type="checkbox"
            name="isSOSContact"
            checked={formData.isSOSContact}
            onChange={handleChange}
          />
          <span className="ec-toggle-text">
            <Shield size={14} /> SOS Contact
          </span>
        </label>
        
        <label className="ec-toggle-label">
          <input
            type="checkbox"
            name="isPrimaryContact"
            checked={formData.isPrimaryContact}
            onChange={handleChange}
          />
          <span className="ec-toggle-text">
            <Star size={14} /> Primary Contact
          </span>
        </label>
      </div>

      <div className="ec-form-actions">
        {onCancel && (
          <button type="button" className="ec-btn-cancel" onClick={onCancel} disabled={isLoading}>
            Cancel
          </button>
        )}
        <button type="submit" className="ec-btn-submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update' : 'Add Contact'}
        </button>
      </div>
    </form>
  );
};

const ContactItem = ({ contact, onEdit, onDelete, isDeleting }) => {
  return (
    <div className="ec-item">
      <div className="ec-item-info">
        <div className="ec-item-header">
          <span className="ec-item-name">{contact.name}</span>
          <span className="ec-item-rel">({contact.relationship})</span>
        </div>
        <div className="ec-item-phone">{contact.phone}</div>
        <div className="ec-item-badges">
          {contact.isSOSContact && <span className="ec-badge sos"><Shield size={10} /> SOS</span>}
          {contact.isPrimaryContact && <span className="ec-badge primary"><Star size={10} /> Primary</span>}
        </div>
      </div>
      <div className="ec-item-actions">
        <button className="ec-icon-btn edit" onClick={() => onEdit(contact)} title="Edit">
          <Edit2 size={16} />
        </button>
        <button 
          className="ec-icon-btn delete" 
          onClick={() => onDelete(contact._id)} 
          disabled={isDeleting}
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

const EmergencyContactsModal = () => {
  const { 
    isModalOpen, setModalOpen, contacts, fetchContacts, 
    addContact, updateContact, deleteContact, isLoading, error 
  } = useContactStore();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [localError, setLocalError] = useState('');

  // Fetch contacts when modal opens
  useEffect(() => {
    if (isModalOpen) {
      fetchContacts();
      setIsAdding(false);
      setEditingId(null);
      setLocalError('');
    }
  }, [isModalOpen, fetchContacts]);

  if (!isModalOpen) return null;

  const handleClose = () => setModalOpen(false);

  const handleAddSubmit = async (data) => {
    setLocalError('');
    const res = await addContact(data);
    if (res.success) {
      setIsAdding(false);
    } else {
      setLocalError(res.message);
    }
  };

  const handleEditSubmit = async (id, data) => {
    setLocalError('');
    const res = await updateContact(id, data);
    if (res.success) {
      setEditingId(null);
    } else {
      setLocalError(res.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this contact?")) {
      await deleteContact(id);
    }
  };

  return (
    <div className="ec-modal-overlay anim-fade-in" onClick={handleClose}>
      <div className="ec-modal-content anim-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="ec-modal-header">
          <div className="ec-modal-title">
            <Shield size={20} className="ec-title-icon" />
            <h2>Emergency Contacts</h2>
          </div>
          <button className="ec-close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="ec-modal-body">
          {(error || localError) && (
            <div className="ec-error-banner">
              {error || localError}
            </div>
          )}

          {isLoading && !isAdding && !editingId && contacts.length === 0 ? (
            <div className="ec-loading">Loading contacts...</div>
          ) : (
            <>
              {/* Contact List */}
              <div className="ec-list">
                {contacts.length === 0 && !isAdding ? (
                  <div className="ec-empty-state">
                    <p>No emergency contacts added yet.</p>
                    <p className="ec-empty-sub">Add trusted friends or family to notify them during an SOS.</p>
                  </div>
                ) : (
                  contacts.map(contact => (
                    <React.Fragment key={contact._id}>
                      {editingId === contact._id ? (
                        <div className="ec-item-edit-wrapper">
                          <ContactForm 
                            initialData={contact}
                            onSubmit={(data) => handleEditSubmit(contact._id, data)}
                            onCancel={() => setEditingId(null)}
                            isLoading={isLoading}
                          />
                        </div>
                      ) : (
                        <ContactItem 
                          contact={contact} 
                          onEdit={(c) => { setIsAdding(false); setEditingId(c._id); }}
                          onDelete={handleDelete}
                          isDeleting={isLoading}
                        />
                      )}
                    </React.Fragment>
                  ))
                )}
              </div>

              {/* Add New Contact Form / Button */}
              {isAdding ? (
                <div className="ec-item-edit-wrapper mt-3">
                  <h4 className="ec-form-heading">Add New Contact</h4>
                  <ContactForm 
                    onSubmit={handleAddSubmit}
                    onCancel={() => setIsAdding(false)}
                    isLoading={isLoading}
                  />
                </div>
              ) : (
                !editingId && (
                  <button className="ec-add-btn" onClick={() => setIsAdding(true)}>
                    <UserPlus size={18} />
                    Add Contact
                  </button>
                )
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencyContactsModal;
