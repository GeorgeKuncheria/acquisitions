import express from 'express';
import { fetchAllUsers, fetchUserById, modifyUser, removeUser } from '#controllers/users.controller.js';

const router = express.Router();

// Get all users
router.get('/', fetchAllUsers);

// Get user by ID
router.get('/:id', fetchUserById);

// Update user (partial update)
router.put('/:id', modifyUser);

// Delete user
router.delete('/:id', removeUser);

export default router;
