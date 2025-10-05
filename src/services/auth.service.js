import bcrypt from 'bcrypt';
import logger from '#config/logger.js';
import { eq } from 'drizzle-orm';
import { db } from '#config/database.js';
import { users } from '#models/user.model.js';

export const hashPassword = async password => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (e) {
    logger.error('Error hashing password:', e);
    throw new Error('Password hashing failed');
  }
};

export const comparePassword = async (password, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (e) {
    logger.error('Error comparing password:', e);
    throw new Error('Password comparison failed');
  }
};

export const authenticateUser = async ({ email, password }) => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    logger.info(`User authenticated successfully: ${email}`);
    return userWithoutPassword;
  } catch (e) {
    logger.error(`Error authenticating user: ${e}`);
    throw e;
  }
};

export const createUser = async ({ name, email, password, role = 'user' }) => {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existingUser.length > 0) {
      throw new Error('Email already in use');
    }

    const hashedPassword = await hashPassword(password);
    const [newUser] = await db
      .insert(users)
      .values({ name, email, password: hashedPassword, role })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      });
    logger.info(`User created succesfully with email: ${email}`);
    return newUser;
  } catch (e) {
    logger.error(`Error creating user: ${e}`);
    throw e;
  }
};
