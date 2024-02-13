import { appdb } from "./appdb";


export class dbarticles extends appdb {
    private from: string = '';
    linkTagToArticle: any;
    constructor() {
        super();
        this.table = 'articles';
        this.uniqueField = 'article_id';
    }

    /**
     * Save article data to the database
     * @param articleData Object containing article data (title, contents, author_id)
     * @returns Object containing information about the saved article
     */
    async saveArticleData(articleData: any) {
        let result = await this.insertRecord(articleData);
        return result;
    }

    /**
     * Retrieve article data by article_id
     * @param articleId Article ID to search for
     * @returns Object containing article data
     */
    async getArticleById(articleId: number) {
        this.where = " WHERE article_id = " + articleId;
        let result = await this.listRecords("article_id, title, contents, author_id");
        return result;
    }

    /**
     * Retrieve articles by author_id
     * @param authorId Author ID to search for
     * @returns Array containing articles data
     */
    async getArticlesByAuthorId(authorId: number) {
        this.where = " WHERE author_id = " + authorId;
        let result = await this.listRecords("article_id, title, contents, author_id");
        return result;
    }
    /**
     * Retrieve all articles from the database
     * @returns Array containing all articles data
     */
    async getAllArticles() {
        this.from = 'articles';
        this.where = ''; // No specific condition to retrieve all articles
        let result = await this.listRecords(" title, contents");
        return result;
    }

    
    /**
     * Retrieve articles by username
     * @param username Username to search for
     * @returns Array containing articles data
     */
    async getArticlesByUsername(username: string) {
        this.from = 'articles INNER JOIN users ON articles.author_id = users.user_id';
        this.where = `INNER JOIN users ON articles.author_id = users.user_id WHERE users.username = '${username}'`;
        let result = await this.listRecords(
            'articles.article_id, articles.title, articles.contents, articles.author_id',
            [username]
        );
        return result;
    }
}

export default  dbarticles;