import {
  fetchAllContacts,
  fetchContactById,
  modifyContactStatus,
  removeContact,
} from '../services/storageService.js';

/**
 * Retrieve paginated, filterable list of all enquiries.
 * Route: GET /api/admin/contacts
 */
export async function getAllContacts(req, res, next) {
  try {
    const { page, limit, status, search } = req.query;

    const { totalRecords, contacts } = await fetchAllContacts({
      page,
      limit,
      status,
      search,
    });

    const totalPages = Math.ceil(totalRecords / limit) || 1;

    return res.status(200).json({
      success: true,
      data: contacts,
      pagination: {
        totalRecords,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Retrieve a single enquiry by UUID.
 * Route: GET /api/admin/contacts/:id
 */
export async function getContactById(req, res, next) {
  try {
    const { id } = req.params;

    const contact = await fetchContactById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: `Enquiry with ID ${id} not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Update enquiry status.
 * Route: PATCH /api/admin/contacts/:id/status
 */
export async function updateContactStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedContact = await modifyContactStatus(id, status);

    if (!updatedContact) {
      return res.status(404).json({
        success: false,
        message: `Enquiry with ID ${id} not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Enquiry status updated to ${status}.`,
      data: updatedContact,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Delete an enquiry permanently.
 * Route: DELETE /api/admin/contacts/:id
 */
export async function deleteContact(req, res, next) {
  try {
    const { id } = req.params;

    const deleted = await removeContact(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Enquiry with ID ${id} not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Enquiry ${id} was deleted successfully.`,
      deletedId: id,
    });
  } catch (error) {
    return next(error);
  }
}
