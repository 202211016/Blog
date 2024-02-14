// Import necessary modules and dependencies
import { appdb } from "./appdb";

export class dbbookmarks extends appdb {
    private from: string = '';

    constructor() {
        super();
        this.table = 'bookmarks';
        this.uniqueField = 'bookmark_id';
    }

    /**
     * Save bookmark data to the database
     * @param bookmarkData Object containing bookmark data (user_id, article_id)
     * @returns Object containing information about the saved bookmark
     */
    async saveBookmark(bookmarkData: any) {
        try {
            const result = await this.insertRecord(bookmarkData);
            return result;
        } catch (error) {
            console.error('Error saving bookmark data to the database:', error);
            return null;
        }
    }

    /**
     * Retrieve bookmarks by article_id
     * @param articleId Article ID to search for
     * @returns Array containing bookmarks data
     */
    async getBookmarksByArticleId(articleId: number, user_id:number) {
        try {
            this.where = " WHERE article_id = " + articleId + " AND user_id = " +user_id;
            const result = await this.listRecords("bookmark_id, user_id, article_id");
            return result;
        } catch (error) {
            console.error('Error retrieving bookmarks by article ID from the database:', error);
            return null;
        }
    }

    /**
     * Get the number of bookmarks for a specific article
     * @param articleId Article ID to get bookmarks for
     * @returns Number of bookmarks
     */
    async getBookmarksCountByArticleId(articleId: number) {
        try {
            const condition = `WHERE article_id = ${articleId}`;
            const result = await this.selectCount(this.table, this.uniqueField, condition);

            return result !== null ? result : 0;
        } catch (error) {
            console.error('Error retrieving bookmarks count by article ID from the database:', error);
            return null;
        }
    }
    
 /**
     * Get the number of articles saved by a specific user
     * @param userId User ID to get saved articles count for
     * @returns Number of saved articles
     */
 async getSavedArticlesCountByUser(userId: number) {
    try {
        const condition = `WHERE user_id = ${userId}`;
        const result = await this.selectCount(this.table, this.uniqueField, condition);

        return result !== null ? result : 0;
    } catch (error) {
        console.error('Error retrieving saved articles count by user ID from the database:', error);
        return null;
    }
}
  
    /**
     * Remove bookmark for a specific article
     * @param bookmarkId Bookmark ID to remove
     * @returns Boolean indicating success or failure
     */
    async removeBookmark(bookmarkId: number) {
        try {
            const result = await this.deleteRecord(bookmarkId);
            return result;
        } catch (error) {
            console.error('Error removing bookmark from the database:', error);
            return null;
        }
    }
}

export default dbbookmarks;
