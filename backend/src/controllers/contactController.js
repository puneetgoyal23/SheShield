import { addContact, getContacts, removeContact, updateContact } from "../services/contactService.js";
import { successResponse } from "../utils/responseFormatter.js";

export const handleAddContact = async (req, res, next) => {
  try {
    const { name, phone, relationship } = req.body;
    const userId = req.user._id;
    const contact = await addContact(userId, { name, phone, relationship });
    return successResponse(res, "Trusted contact added successfully.", { contact }, 201);
  } catch (error) {
    next(error);
  }
};

export const handleGetContacts = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const contacts = await getContacts(userId);
    return successResponse(res, "Trusted contacts retrieved successfully.", { contacts }, 200);
  } catch (error) {
    next(error);
  }
};

export const handleRemoveContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const deletedContact = await removeContact(userId, id);
    return successResponse(res, "Trusted contact deleted successfully.", { contact: deletedContact }, 200);
  } catch (error) {
    next(error);
  }
};

export const handleUpdateContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { isPrimaryContact, isSOSContact, name, phone, relationship } = req.body;
    
    const updates = {};
    if (isPrimaryContact !== undefined) updates.isPrimaryContact = isPrimaryContact;
    if (isSOSContact !== undefined) updates.isSOSContact = isSOSContact;
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (relationship) updates.relationship = relationship;

    const updatedContact = await updateContact(userId, id, updates);
    return successResponse(res, "Trusted contact updated successfully.", { contact: updatedContact }, 200);
  } catch (error) {
    next(error);
  }
};
