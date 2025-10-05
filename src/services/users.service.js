import logger from '#config/logger.js';
import {eq} from 'drizzle-orm';
import {db} from '#config/database.js';
import {users} from '#models/user.model.js';

export const getAllUsers = async() => {
    try{
        const allUsers = await db.select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt
        }).from(users);

        return allUsers;
    }
    catch(e){
        logger.error('Error fetching users', { error: e.message });
        throw new Error('Could not fetch users');
    }
};

export const getUserById = async (id) => {
    try {
        const [user] = await db.select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt
        }).from(users).where(eq(users.id, id)).limit(1);

        if (!user) {
            throw new Error('User not found');
        }

        logger.info(`User fetched successfully: ID ${id}`);
        return user;
    }
    catch (e) {
        logger.error('Error fetching user by ID', { error: e.message, id });
        throw e;
    }
};

export const updateUser = async (id, updates) => {
    try {
        // First check if user exists
        const existingUser = await getUserById(id);
        
        // If email is being updated, check for duplicates
        if (updates.email && updates.email !== existingUser.email) {
            const [duplicateUser] = await db.select().from(users).where(eq(users.email, updates.email)).limit(1);
            if (duplicateUser) {
                throw new Error('Email already in use');
            }
        }

        // Add timestamp for updated_at
        const updateData = {
            ...updates,
            updatedAt: new Date()
        };

        const [updatedUser] = await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, id))
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt
            });

        logger.info(`User updated successfully: ID ${id}`);
        return updatedUser;
    }
    catch (e) {
        logger.error('Error updating user', { error: e.message, id, updates });
        throw e;
    }
};

export const deleteUser = async (id) => {
    try {
        // First check if user exists
        await getUserById(id);
        
        const [deletedUser] = await db
            .delete(users)
            .where(eq(users.id, id))
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role
            });

        logger.info(`User deleted successfully: ID ${id}`);
        return deletedUser;
    }
    catch (e) {
        logger.error('Error deleting user', { error: e.message, id });
        throw e;
    }
};
