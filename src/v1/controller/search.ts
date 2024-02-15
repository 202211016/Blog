import express from 'express';
import { dbarticles } from '../model/dbarticle';
import { dbcomments } from '../model/dbcomments';
import { dblikes } from '../model/dblike';
import { functions } from '../library/functions';
import { validations } from '../library/validation';
import Joi from "joi";
const router = express.Router();

/* 
// routes
*/
router.get('/search/:username',validateUsername, searchArticles);

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

/*  
// search article by username and get all the details 
*/
async function searchArticles(req: any, res: any) {
    var functionsObj = new functions();
    try {
        const username = req.params.username;
        console.log('articleId: ', username);
        if (!username) {
        return res.json({ status: 0, message: 'Article username  is missing.' });
        }
        const articlesObj = new dbarticles();
        const searchResults = await articlesObj.getArticlesByUsername(username);
        console.log('searchResults: ', searchResults);
        if (!searchResults || searchResults.length===0) {
            return res.send(functionsObj.output(0,'Failed to retrive the article'));
        } 
        const commentsObj = new dbcomments();
        const likesObj = new dblikes();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const resultPromises = searchResults.map(async (article: any) => {
            const comments = await commentsObj.getCommentsByArticleId(article.article_id);
            const likes = await likesObj.getLikesByArticleId(article.article_id);
            return {
                article,
                comments,
                likes,
            };
        });  
        console.log('resultPromises: ', resultPromises);
        const detailedResults = await Promise.all(resultPromises);
        console.log('detailedResults: ', detailedResults);
        return res.send(functionsObj.output(1,'Results',{searchResults:detailedResults}));
    } catch (error) {
        console.error('Error searching for articles:', error);
        res.send(functionsObj.output(0, 'Internal Server Error', null));
    }
}



export default router;
