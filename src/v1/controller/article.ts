// Import necessary modules and dependencies
import express from "express";
import Joi from "joi";
import { functions } from "../library/functions";
import { validations } from '../library/validation';
import { dbarticles } from "../model/dbarticle";
import {dbusers} from '../model/dbuser';
const bcrypt = require ('bcryptjs');
const router = express.Router();
/*
//validation for the id in the parameter  
*/
export function validateID(req: any, res: any, next: any) {
    let functionsObj = new functions();
    try {
        const id:number = Number(req.params.id);
        
        if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
            return res.send(functionsObj.output(0, 'Invalid id parameter (not an integer)', {}));
        }
        next();
    } catch (err) {
        res.send(functionsObj.output(0, 'Internal Server Error', {}));
    }
}
/*
//routes
*/
router.post('/article',articleSchema, createArticle);
router.get('/article/:id',validateID, getArticleById); 
router.delete('/article/:id', validateID,deleteArticle);
router.get('/articles', getAllArticles);
router.get('/articles/:username', (req: any, res: any) => {
    const username = req.params.username;
    getArticlesByUsername(username, res),validateUsername;
});
/*
// Validation for the username in the parameter
*/
export function validateUsername(req: any, res: any, next: any) {
    let functionsObj = new functions();
    try {
        const username: string = req.params.username;
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(username)) {
            return res.send(functionsObj.output(0, 'Invalid username parameter', {}));
        }
        next();
    } catch (err) {
        res.send(functionsObj.output(0, 'Internal Server Error', {}));
    }
}
/**
 * Validation function for article creation route
 */
function articleSchema(req: any, res: any, next: any) {
    const schema = Joi.object({
        title: Joi.string().max(255).required(),
        contents: Joi.string().required(),   
    });
    const validationsObj = new validations();
    if (!validationsObj.validateRequest(req, res, next, schema)) {
        return false;
    }
}

/**
 * Article creation 
 */

async function createArticle(req: any, res: any) {
    var functionsObj = new functions();
    let articlesObj = new dbarticles();

    interface ArticleData {
        title: string;
        contents: string;
        author_id?: number;
    }
    const articleData = {} as ArticleData;
    articleData.title = req.body.title;
    articleData.contents = req.body.contents;
    articleData.author_id = req.tokenData.user.user_id; 
    console.log("Request Body:", req.body);
    if (articleData.author_id === undefined) {
        console.error("Author ID is undefined in createArticle");    
        return res.send(functionsObj.output(0, 'Author ID is undefined',null));
    }
    const result: any = await articlesObj.saveArticleData(articleData);
    console.log('article data ,articleData');
   return res.send(functionsObj.output(1, 'Article addede sucessfully', result)); 
}
/**
 * Retrieve article by articleid
 */
async function getArticleById(req: any, res: any) {
    var functionsObj = new functions();
    const articlesObj = new dbarticles();

    try {
        const articleId = req.params.id;
        if (!articleId) {
            return res.send(functionsObj.output(0, 'Article ID parameter is missing.',null));
        }
        const article = await articlesObj.getArticleById(articleId);
        if (!article || article.length === 0) {
            return res.send(functionsObj.output(0, 'No article found for the given ID.',null));
        }
        res.send(functionsObj.output(1, 'Article List ', { data: article }));
    } catch (error) {
        console.error('Error retrieving article by ID:', error);
       return res.send(functionsObj.output(0, 'Internal Server Error', null));
    }
}

/**
 * Retrieve all articles route 
 */

async function getAllArticles(req: any, res: any) {
    var functionsObj = new functions();
    try {
        const articlesObj = new dbarticles();
        const usersObj = new dbusers();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        articlesObj.page = page;
         articlesObj.rpp = limit;
        const articlesWithAuthors = await articlesObj. getAllArticlesWithAuthors();
        if (!articlesWithAuthors || articlesWithAuthors.length === 0) {
            return res.send(functionsObj.output(0, 'No articles found.', null));
        }
        res.send(functionsObj.output(1, 'Articles', { data: articlesWithAuthors }));
    } catch (error) {
        console.error('Error retrieving all articles:', error);
        res.send(functionsObj.output(0, 'Internal Server Error', null));
    }
}
/**
 * Retrieve articles by username route
 */
async function getArticlesByUsername(username: string, res: any) {
     var functionsObj = new functions();
    try {
        const articlesObj = new dbarticles();
        const articles = await articlesObj.getArticlesByUsername(username);
        if (!articles || articles.length === 0) {
            return res.send(functionsObj.output(0, 'No articles found for the given username.',null));
        }
        res.send(functionsObj.output(1, 'SUCCESS', { data: articles }));
    } catch (error) {
        console.error('Error retrieving articles by username:', error);
        res.send(functionsObj.output(0, 'Internal Server Error',null));
    }
}

/**
 * Delete article by ID route
 */

async function deleteArticle(req: any, res: any) {
   const articlesObj = new dbarticles();
    var functionsObj = new functions();
    try {
        const articleId = req.params.id;
        if (!articleId) {
            return res.send(functionsObj.output(0, 'Article ID parameter is missing.', null));
        }
        const article = await articlesObj.getArticleById(articleId);
        if (!article || article.length === 0) {
            return res.send(functionsObj.output(0, 'No article found for the given ID.', null));
        }
        if (article[0].author_id !== req.params.id) {
            return res.send(functionsObj.output(0, 'You do not have permission to delete this article.', null));
        }
        const result = await articlesObj.deleteRecord(articleId);
        if (!result) {
            return res.send(functionsObj.output(0, 'No article found for the given ID.', null));
        }
        res.send(functionsObj.output(1,'Articles Deleted Sucessfully'));
    } catch (error) {
        console.error('Error deleting article by ID:', error);
        res.send(functionsObj.output(0, 'Internal Server Error', {}));
    }
}
export default router;
