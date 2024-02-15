import { appdb } from "./appdb";
const bcrypt = require('bcryptjs');   
const jwt = require('jsonwebtoken');

export class dbusers extends appdb {
    private jwtSecret: string = ''; 
    constructor() {
        super();
        this.table = 'users';
        this.uniqueField = 'user_id';
        this.jwtSecret='abcdefg';
       
    }

    /**
     * Save user data to the database
     * @param userData Object containing user data (username, email, password, registration_date)
     * @returns Object containing information about the saved user
     */
    async saveUserData(userData: any) {
   
         let result = await this.insertRecord(userData);
        return result;
    }
     /**
     * Retrieve user data by user ID
     * @param userId User ID to search for
     * @returns Object containing user data
     */
     async getUserById(userId: string) {
        try {
            const result = await this.select(this.table, '*', `WHERE user_id = '${userId}'`, '', 'LIMIT 1');
            console.log('Retrieved User Data:', result);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

/**
     * Get user by email.
     * @param email User's email
     * @returns Promise<any | null>
     */
async getUserByEmail(email: string){
    try {
        
        const result = await this.select(this.table, '*', `WHERE email = '${email}'`, '', 'LIMIT 1');
        console.log('Retrieved User Data:',result);
        return result.length > 0 ? result[0] : null;
    } catch (error) {
        console.error(error);
        return null;
    }
}

/**
 * Get user profile by username
 * @param username Username to identify the user
 * @returns Object containing information about the user or null if user not found
 */

async getUserByUsername(username: string) {
    try {
        // Use the select method to fetch user by username
        const result = await this.select(this.table, '*', `WHERE username = '${username}'`, '', 'LIMIT 1');
        console.log('Retrieved User Data:', result);
        // Return the first user if found, otherwise null
        return result.length > 0 ? result[0] : null;
    } catch (error) {
        console.error(error);
        return null;
    }
}

async getUserByUserids(userId: string) {
    try {
        // Use the select method to fetch user by username
        const result = await this.select(this.table, '*', `WHERE user_id = '${userId}'`, '', 'LIMIT 1');
        console.log('Retrieved User Data:', result);
        // Return the first user if found, otherwise null
        return result.length > 0 ? result[0] : null;
    } catch (error) {
        console.error(error);
        return null;
    }
}
/**
     * Update user profile by username
     * @param username Username to identify the user
     * @param newUsername New username to update
     * @returns Object containing information about the updated user or null if update fails
     */
async updateUsername(currentUsername: string, newUsername: string) {
    try {
        const existingUser = await this.getUserByUsername(newUsername);
        if (existingUser) {
            throw new Error('Username already exists. Please choose a different username.');
        }
        const userToUpdate = await this.getUserByUserids(currentUsername);
        if (!userToUpdate) {
            throw new Error('User not found.');
        }
        const updateData = { username: newUsername }; 
        const updatedUser = await this.updateRecord(userToUpdate.user_id, updateData);

        return updatedUser;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
}

 
export default  dbusers;

