import express from "express";
import { dbbookmarks } from "../model/dbbookmarks";
import { celebrate, Joi, Segments } from 'celebrate'; 
import { validations } from '../library/validation';

import { functions } from "../library/functions";
import { dbarticles } from "../model/dbarticle";
const router = express.Router();

// Joi validation schema for the id parameter
const idValidationSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
});

// Middleware function for parameter validation
const validateIDParam = (req: any, res : any, next:any ) => {
    const { error } = idValidationSchema.validate(req.params);
    if (error) {
        return res.json({ error: error.details[0].message });
    }
    next();
};
router.post('/article/:id/bookmark', validateIDParam,bookmarkArticle);
router.delete('/article/:id/bookmark',validateIDParam,removeBookmark);
router.get('/article/:id/bookmarks/count', validateIDParam,getBookmarksCount);
router.get('/user/:id/bookmarks/count', validateIDParam,getUserBookmarksCount);
router.get('/user/bookmarks', getAllUserBookmarks);

/*
//  save the article 
*/
async function bookmarkArticle(req: any, res: any)
 {
    var functionsObj = new functions(); 
       try {
        const articleId = req.params.id;
        const user_id = req.tokenData.user.user_id;
        if (!articleId) {
            return res.send(functionsObj.output(0, 'Article ID parameter is missing.'));
        }
        const bookmarksObj = new dbbookmarks();
        const bookmarkData = {
            user_id: user_id,
            article_id: articleId,
        };
        const result = await bookmarksObj.saveBookmark(bookmarkData);
        if (!result) {
            return res.send(functionsObj.output(0, 'Failed to add bookmark for the article.',null));
        }
        res.send(functionsObj.output(1, 'Article bookmarked successfully.',result));
    } catch (error) {
        console.error('Error bookmarking the article:', error);
        res.send(functionsObj.output(0, 'Internal Server Error',null));
    }
}


/*
// total how many user have saved the article
*/

async function getBookmarksCount(req: any, res: any) {
    var functionsObj = new functions();
    try {
        const articleId = req.params.id;

        if (!articleId) {
            return res.send(functionsObj.output(0, 'Article ID parameter is missing.',null));
        }
        const bookmarksObj = new dbbookmarks();
        const bookmarksCount = await bookmarksObj.getBookmarksCountByArticleId(articleId);
        if (bookmarksCount === null) {
            return res.send(functionsObj.output(0, 'Failed to retrieve bookmarks count for the article.',null));
        }
        res.send(functionsObj.output(1, 'bookmark count', { bookmarks_count: bookmarksCount }));
    } catch (error) {
        console.error('Error retrieving bookmarks count for article:', error);
        res.send(functionsObj.output(0, 'Internal Server Error',null));
    }
}
/*
//  Total  count bookmark saved 
*/
async function getUserBookmarksCount(req: any, res: any) {
    var functionsObj = new functions();
    try {
        const userId = req.params.id;

        if (!userId) {
            return res.send(functionsObj.output(0, 'User ID parameter is missing.',null));
        }
        const bookmarksObj = new dbbookmarks();
        const bookmarksCount = await bookmarksObj.getSavedArticlesCountByUser(userId);
        if (bookmarksCount === null) {
            return res.send(functionsObj.output(0, 'Failed to retrieve saved articles count for the user.',null));
        }
        res.send(functionsObj.output(1, 'Total bookmarks saved by ther user ', { saved_articles_count: bookmarksCount }));
    } catch (error) {
        console.error('Error retrieving saved articles count for user:', error);
        res.send(functionsObj.output(0, 'Internal Server Error'));
    }
}
/*
// listing of the users bookmarks 
 */
async function getAllUserBookmarks(req: any, res: any) {
    var functionsObj = new functions();
    try {
        const user_id = req.tokenData.user.user_id;
        const bookmarksObj = new dbbookmarks();
        const userBookmarks = await bookmarksObj.getAllBookmarksByUser(user_id);
        if (!userBookmarks) {
            return res.send(functionsObj.output(0, 'Failed to retrieve saved articles for the user.'));
        }
        const articleIds = userBookmarks.map((bookmark: any) => bookmark.article_id);
        const articlesObj = new dbarticles();
        const articles = await articlesObj.getArticleById(articleIds);
        if (!articles) {
            return res.send(functionsObj.output(0, 'Failed to retrieve articles.'));
        }
        const result = userBookmarks.map((bookmark: any) => {
            const article = articles.find((a: any) => a.article_id === bookmark.article_id);
            return {
                title: article.title,
                contents: article.contents,
            };
        });
        res.send(functionsObj.output(1, 'Bookmark', { user_bookmarks: result }));
    } catch (error) {
        console.error('Error retrieving saved articles for user:', error);
        res.send(functionsObj.output(0, 'Internal Server Error',null));
    }
}
/*
// Delete Bookmark
*/
async function removeBookmark(req: any, res: any) {
    var functionsObj = new functions();
    try {
        const articleId = req.params.id;
        const user_id = req.tokenData.user.user_id;
        const bookmarksObj = new dbbookmarks();
        const bookmarks = await bookmarksObj.getBookmarksByArticleId(articleId, user_id);
        const matchingBookmark = bookmarks?.find((bookmark: any) => bookmark.user_id === user_id);
        if (!matchingBookmark) {
            res.send(functionsObj.output(0, 'Bookmark not found for the article.'));
            return;
        }
        const result = await bookmarksObj.removeBookmark(matchingBookmark.bookmark_id);
        if (!result) {
            res.send(functionsObj.output(0, 'Failed to remove bookmark for the article.'));
            return;
        }
        res.send(functionsObj.output(1, 'Article bookmark removed successfully.'));
    } catch (error) {
        console.error('Error removing bookmark for the article:', error);
        res.send(functionsObj.output(0, 'Internal Server Error'));
    }
}
export default router;
