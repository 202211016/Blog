import { appdb } from "./appdb";
import {dbusers} from "../model/dbuser";
export class dbcomments extends appdb {
    private from: string = '';
    usersObj: dbusers;

    constructor() {
        super();
        this.table = 'comment_db';
        this.uniqueField = 'comment_id';
        this.usersObj = new dbusers(); 
    }

    /**
     * Save comment data to the database
     * @param commentData Object containing comment data (article_id, user_id, content)
     * @returns Object containing information about the saved comment
     */
    async saveCommentData(commentData: any) {
        try {
            const result = await this.insertRecord(commentData);
            return result;
        } catch (error) {
            console.error('Error saving comment data to the database:', error);
            return null;
        }
    }

    /**
     * Retrieve comments by article_id
     * @param articleId Article ID to search for
     * @returns Array containing comments data
     */
   
    /**
     * Retrieve comments by article_id
     * @param articleId Article ID to search for
     * @returns Array containing comments data with contents, comment_date, and username
     */
    async getCommentsByArticleId(articleId: number) {
        try {
            // Assuming you have a User table with the 'users' table name
            this.from = 'comment_db As c';
            this.where = `INNER JOIN users ON comment_db.user_id = users.user_id WHERE comment_db.article_id = ${articleId} `;
            const result = await this.listRecords(' comment_db.contents, comment_db.comment_date, users.username', ['']);
            console.log('result: ', result);
            return result;
        } catch (error) {
            console.error('Error retrieving comments by article ID from the database:', error);
            return null;
        }
    }

    /**
     * Retrieve comments by user_id
     * @param userId User ID to search for
     * @returns Array containing comments data
     */
    async getCommentsByUserId(userId: number) {
        try {
            this.where = " WHERE user_id = " + userId;
            const result = await this.listRecords(" contents, comment_date");
            return result;
        } catch (error) {
            console.error('Error retrieving comments by user ID from the database:', error);
            return null;
        }
    }

/**
 * Delete a comment from the database by its ID
 * @param {number} commentId - The ID of the comment to be deleted
 * @returns {boolean|null} - Returns a boolean indicating success or failure, or null if an error occurs
 */
    async deleteComment(commentId: number) {
        try {
            const result = await this.deleteRecord(commentId);
            return result;
        } catch (error) {
            console.error('Error deleting comment from the database:', error);
            return null;
        }
    }

}

export default  dbcomments;