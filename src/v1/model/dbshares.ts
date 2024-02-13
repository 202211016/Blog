import { appdb } from "./appdb";

export class dbshares extends appdb {
    private from: string = '';

    constructor() {
        super();
        this.table = 'shares';
        this.uniqueField = 'share_id';
    }

    /**
     * Save share data to the database
     * @param shareData Object containing share data (user_id, target_user_id, article_id)
     * @returns Object containing information about the saved share
     */
    async saveShareData(shareData: any) {
        try {
            const result = await this.insertRecord(shareData);
            return result;
        } catch (error) {
            console.error('Error saving share data to the database:', error);
            return null;
        }
    }

    /**
     * Retrieve shares by user_id and article_id
     * @param userId User ID to search for
     * @param articleId Article ID to search for
     * @returns Array containing share data
     */
    async getSharesByUserAndArticle(targetUserId: number, articleId: number) {
        try {
            this.from = 'shares  as s'
            this.where = `INNER JOIN users ON shares.user_id, shares.article_id
             WHERE user_id = ${targetUserId} AND article_id = ${articleId}`;
            const result = await this.listRecords('share.share_id, shares.user_id, shares.target_user_id, shares.article_id, shares.created_at,users.username',['']);
            return result;
        } catch (error) {
            console.error('Error retrieving shares by user ID and article ID from the database:', error);
            return null;
        }
    }
    async getSharedArticlesByUserId(userId: number) {
        try {
            this.where = " WHERE target_user_id = " + userId;
            const result = await this.listRecords("article_id, user_id");
            return result;
        } catch (error) {
            console.error('Error retrieving shared articles by user ID from the database:', error);
            return null;
        }
    }

    /**
     * Retrieve shares by article_id
     * @param articleId Article ID to search for
     * @returns Array containing shares data
     */
    async getSharesByArticleId(articleId: number) {
        try {
            this.where = ` WHERE article_id = ${articleId}`;
            const result = await this.listRecords("share_id, user_id, target_user_id, created_at");
            return result;
        } catch (error) {
            console.error('Error retrieving shares by article ID from the database:', error);
            return null;
        }
    }

    /**
     * Retrieve shares by user_id
     * @param userId User ID to search for
     * @returns Array containing shares data
     */
    async getSharesByUserId(userId: number) {
        try {
            this.where = ` WHERE user_id = ${userId}`;
            const result = await this.listRecords("share_id, user_id, target_user_id, article_id, created_at");
            return result;
        } catch (error) {
            console.error('Error retrieving shares by user ID from the database:', error);
            return null;
        }
    }
    
    /**
     * Get the number of shares for a specific article
     * @param articleId Article ID to get shares for
     * @returns Number of shares
     */
    async getSharesCountByArticleId(articleId: number) {
        try {
            const condition = `WHERE article_id = ${articleId}`;
            const result = await this.selectCount(this.table, this.uniqueField, condition);

            return result !== null ? result : 0;
        } catch (error) {
            console.error('Error retrieving shares count by article ID from the database:', error);
            return null;
        }
    }

    /**
     * Delete share by share_id
     * @param shareId Share ID to remove
     * @returns Boolean indicating success or failure
     */
    async deleteShare(shareId: number) {
        try {
            const result = await this.deleteRecord(shareId);
            return result;
        } catch (error) {
            console.error('Error deleting share from the database:', error);
            return null;
        }
    }
}

export default dbshares;
