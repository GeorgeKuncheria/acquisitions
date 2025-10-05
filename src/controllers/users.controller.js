import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '#services/users.service.js';
import {
  userIdSchema,
  updateUserSchema,
} from '#validations/users.validations.js';
import { formatValidationErrors } from '#utils/format.js';
import logger from '#config/logger.js';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Fetching all users');
    const users = await getAllUsers();

    return res.json({
      message: 'Users fetched successfully',
      users,
      count: users.length,
    });
  } catch (e) {
    logger.error(e);
    next(e);
  }
};

export const fetchUserById = async (req, res, next) => {
  try {
    // Validate the ID parameter
    const validationResult = userIdSchema.safeParse({ id: req.params.id });
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: formatValidationErrors(validationResult.error),
      });
    }

    const { id } = validationResult.data;
    logger.info(`Fetching user by ID: ${id}`);

    const user = await getUserById(id);

    return res.json({
      message: 'User fetched successfully',
      user,
    });
  } catch (e) {
    logger.error('Error fetching user by ID:', e);

    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    next(e);
  }
};

export const modifyUser = async (req, res, next) => {
  try {
    // Validate the ID parameter
    const idValidationResult = userIdSchema.safeParse({ id: req.params.id });
    if (!idValidationResult.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: formatValidationErrors(idValidationResult.error),
      });
    }

    // Validate the update data
    const updateValidationResult = updateUserSchema.safeParse(req.body);
    if (!updateValidationResult.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: formatValidationErrors(updateValidationResult.error),
      });
    }

    const { id } = idValidationResult.data;
    const updates = updateValidationResult.data;

    // TODO: Add authentication middleware to populate req.user
    // Authorization logic:
    // - Users can only update their own information
    // - Only admins can change role field
    // - Only admins can update other users

    // Example authorization logic (uncomment when auth middleware is available):
    // if (!req.user) {
    //     return res.status(401).json({ error: 'Authentication required' });
    // }
    //
    // const isAdmin = req.user.role === 'admin';
    // const isOwnProfile = req.user.id === id;
    //
    // if (!isAdmin && !isOwnProfile) {
    //     return res.status(403).json({ error: 'You can only update your own profile' });
    // }
    //
    // if (updates.role && !isAdmin) {
    //     return res.status(403).json({ error: 'Only administrators can change user roles' });
    // }

    logger.info(`Updating user: ID ${id}`, { updates });

    const updatedUser = await updateUser(id, updates);

    return res.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (e) {
    logger.error('Error updating user:', e);

    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    if (e.message === 'Email already in use') {
      return res.status(409).json({ error: 'Email already in use' });
    }

    next(e);
  }
};

export const removeUser = async (req, res, next) => {
  try {
    // Validate the ID parameter
    const validationResult = userIdSchema.safeParse({ id: req.params.id });
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: formatValidationErrors(validationResult.error),
      });
    }

    const { id } = validationResult.data;

    // TODO: Add authentication middleware to populate req.user
    // Authorization logic:
    // - Users cannot delete their own account (prevent accidental deletion)
    // - Only admins can delete user accounts

    // Example authorization logic (uncomment when auth middleware is available):
    // if (!req.user) {
    //     return res.status(401).json({ error: 'Authentication required' });
    // }
    //
    // if (req.user.role !== 'admin') {
    //     return res.status(403).json({ error: 'Only administrators can delete users' });
    // }
    //
    // if (req.user.id === id) {
    //     return res.status(403).json({ error: 'You cannot delete your own account' });
    // }

    logger.info(`Deleting user: ID ${id}`);

    const deletedUser = await deleteUser(id);

    return res.json({
      message: 'User deleted successfully',
      user: deletedUser,
    });
  } catch (e) {
    logger.error('Error deleting user:', e);

    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    next(e);
  }
};
