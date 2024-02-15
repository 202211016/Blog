import express from "express";
import { functions } from "../library/functions";
import { validations } from '../library/validation';
import { dbarticles } from "../model/dbarticle";
import { dbcomments } from "../model/dbcomments";
import { dbusers } from "../model/dbuser";
import { Request, Response } from 'express';
const jwt = require('jsonwebtoken');

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
// routes
*/
router.post('/article/:id/comment',validateID,addCommentToArticle);
router.get('/:id/comments',validateID,getAllCommentsWithAuthors);
router.delete('/article/:id/comment/:commentId',deleteComment);

/*
  Add comment to the article
**/

async function addCommentToArticle(req: any, res: any) {
    var functionsObj = new functions();
    try {
        const articleId = req.params.id;
        if (!articleId) {
            return res.send(functionsObj.output(0, 'Article ID parameter is missing.'));
        }
        const articlesObj = new dbarticles();
        const article = await articlesObj.getArticleById(articleId);
                                       
        if (!article || article.length === 0) {
            return res.send(functionsObj.output(0, 'No article found for the given ID.'));
        }
        const commentsObj = new dbcomments();
        const commentData = {
            contents: req.body.contents,
            user_id: req.tokenData.user.user_id, 
            article_id: articleId,
        };
        const result = await commentsObj.saveCommentData(commentData);
        console.log('result: ', result);
        console.log('Comment Data:', commentData);
        if (!commentData) {
            return res.send(functionsObj.output(0, 'Failed to add comment to the article.'));
        }
        res.send(functionsObj.output(1, 'Comment Added Sucessfully' ));
    } catch (error) {
        console.error('Error adding comment to the article:', error);
       return res.send(functionsObj.output(0, 'Internal Server Error',null));
    }
}

interface Author {
    user: {
        username: string;
    };
}

async function getAllCommentsWithAuthors(req: any, res: any) {
    var functionsObj = new functions();
    try {
        const commentsObj = new dbcomments();
        const usersObj = new dbusers();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const articleId = req.params.id || null;
        console.log('articleId: ', articleId);
        commentsObj.page = page;
        commentsObj.rpp = limit;
        const comments = articleId !== null ? await commentsObj.getCommentsByArticleId(articleId) : null;
        console.log('comments: ', comments);
        if (!comments || comments.length === 0) {
            return res.send(functionsObj.output(0, 'No comments found for the specified article.', null));
        }    
        res.send(functionsObj.output(1, 'Comments', { coomments : comments }));
    } catch (error) {
        console.error('Error retrieving comments with authors:', error);
        res.send(functionsObj.output(0, 'Internal Server Error', null));
    }
}

/** 
         Delete the comment by the particular author 
**/
async function deleteComment(req: any, res: any) {
    var functionsObj = new functions();
    try {
        const articleId = req.params.id;
        const commentId = req.params.commentId;
        if (!articleId || !commentId) {
            return res.send(functionsObj.output(0, 'Article ID or Comment ID parameter is missing.',null));
        }
        const token = req.headers.authorization;
        if (!token) {
            return res.send(functionsObj.output(0, 'Unauthorized: Missing token.',null));
        }
            const userId = req.tokenData.user.user_id;
        const articlesObj = new dbarticles();
        const article = await articlesObj.getArticleById(articleId);
        if (!article || article.authorId !== userId) {
            return res.send(functionsObj.output(0, 'You are not the author of this article.'));
        }
        const commentsObj = new dbcomments();
        const result = await commentsObj.deleteComment(commentId);
        if (!result) {
            return res.send(functionsObj.output(0, 'It is not your article.',null));
        }
        res.send(functionsObj.output(1,'Sucessfully dleted comment '));
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.send(functionsObj.output(0, 'Internal Server Error'));
    }
}

export default router;
