import { appdb } from "./appdb";
import dbusers from "./dbuser";

export class dblikes extends appdb {
    private from: string = '';
    usersObj: dbusers;

    constructor() {
        super();
        this.table = 'likes';
        this.uniqueField = 'like_id';
        this.usersObj = new dbusers();
    }

    /**
     * Save like data to the database
     * @param likeData Object containing like data (article_id, user_id)
     * @returns Object containing information about the saved like
     */
    async saveLikeData(likeData: any) {
        try {
            const result = await this.insertRecord(likeData);
            return result;
        } catch (error) {
            console.error('Error saving like data to the database:', error);
            return null;
        }
    }
    /**
     * Retrieve likes by user_id and article_id
     * @param userId User ID to search for
     * @param articleId Article ID to search for
     * @returns Array containing like data
     */
    async getLikesByUserAndArticle(userId: number, articleId: number) {
        try {
            this.where = ` WHERE user_id = ${userId} AND article_id = ${articleId}`;
            const result = await this.listRecords("like_id, article_id, user_id, like_date");
            return result;
        } catch (error) {
            console.error('Error retrieving likes by user ID and article ID from the database:', error);
            return null;
        }
    }
    /**
     * Retrieve likes by article_id
     * @param articleId Article ID to search for
     * @returns Array containing likes data
     */
    async getLikesByArticleId(articleId: number) {
        try {
            this.where = `INNER JOIN users ON likes.user_id = users.user_id WHERE likes.article_id = ${articleId} `;
            const result = await this.listRecords('likes.article_id,users.username,likes.article_id,likes.like_date',['']);
            return result;
        } catch (error) {
            console.error('Error retrieving likes by article ID from the database:', error);
            return null;
        }
    }

    /**
     * Retrieve likes by user_id
     * @param userId User ID to search for
     * @returns Array containing likes data
     */
    async getLikesByUserId(userId: number) {
        try {
            this.where = " WHERE user_id = " + userId;
            const result = await this.listRecords("like_id, article_id, user_id, like_date");
            return result;
        } catch (error) {
            console.error('Error retrieving likes by user ID from the database:', error);
            return null;
        }
    }
    
    /**
     * Get the number of likes for a specific article
     * @param articleId Article ID to get likes for
     * @returns Number of likes
     */
    async getLikesCountByArticleId(articleId: number) {
        try {
            const condition = `WHERE article_id = ${articleId}`;
            const result = await this.selectCount(this.table, this.uniqueField, condition);

            return result !== null ? result : 0;
        } catch (error) {
            console.error('Error retrieving likes count by article ID from the database:', error);
            return null;
        }
    }
  /**
     * Unliking the article 
     * @param likeId Like id for the article 
     * @returns Unliking 
     */
    async unlikeArticle(likeId: number) {
        try {
            const result = await this.deleteRecord(likeId);
            return result;
        } catch (error) {
            console.error('Error unliking the article from the database:', error);
            return null;
        }
    }
}

export default dblikes;
