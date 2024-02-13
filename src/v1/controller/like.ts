import express from "express";
import { dblikes } from "../model/dblike";
import {dbusers} from "../model/dbuser";
import { functions } from "../library/functions";

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
router.get('/:id/likes', validateID, getLikesWithAuthors);
router.get('/article/:id/likes/count',validateID,getLikesCount);
router.post('/article/:id/like',validateID,like);
/*
// likes  forthe articles 
*/
async function getLikesWithAuthors(req: any, res: any) {
    var functionsObj = new functions();
    try {
        const likesObj = new dblikes();
        const usersObj = new dbusers();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const articleId = req.params.id || null;
        likesObj.page = page;
        likesObj.rpp = limit;
        const likes = articleId !== null ? await 
        likesObj.getLikesByArticleId(articleId): null;
        console.log("like", likes);
        if (!likes || likes.length === 0) {
            return res.send(functionsObj.output(0, 'No likes found for the specified article.', null));
        }
        res.send(functionsObj.output(1, 'Likes', { likes: likes }));
    } catch (error) {
        console.error('Error retrieving likes with authors:', error);
        res.send(functionsObj.output(0, 'Internal Server Error', null));
    }
}

/*
//like counts
*/
async function getLikesCount(req: any, res: any) {
    var functionsObj = new functions();
    try {
        const articleId = req.params.id;
        if (!articleId) {
            return res.send(functionsObj.output(0,'ArticleId Parameter is missing',null));
        }
        const likesObj = new dblikes();
        const likesCount = await likesObj.getLikesCountByArticleId(articleId);
        if (likesCount === null) {
            return res.send(functionsObj.output(0,'Failed to retrive the likes for this article'));
        }
    else{
        
        return res.send(functionsObj.output(1,"liks of the article",{likesCount : likesCount}));
    }
    } catch (error) {
        console.error('Error retrieving likes count for article:', error);
        res.send(functionsObj.output(0, 'Internal Server Error', null));
    }
}

/*
// like
*/

async function like(req: any, res: any) {
    var functionsObj = new functions();
    try {
        const articleId = req.params.id;
        const user_id = req.tokenData.user.user_id;
        if (!articleId) {
            return res.send(functionsObj.output(0,'ArticleParameter is missing'));
        }
        const likesObj = new dblikes();
        const existingLike = await likesObj.getLikesByUserAndArticle(user_id, articleId);
        if (existingLike.length > 0) {     
            const result = await likesObj.unlikeArticle(existingLike[0].like_id);
            if (!result) {
                return res.send(functionsObj.output(0,'Failed to dislike the article',null));
            }
            return res.send(functionsObj.output(1,'Article disliked Sucessfully'));
        } else {
            const likeData = {
                user_id: user_id,
                article_id: articleId,
            };
            const result = await likesObj.saveLikeData(likeData);
            if (!result) {
               return res.send(functionsObj.output(0,'Failed to like the article'));
            }

           return res.send(functionsObj.output(1,'Article Liked Sucessfully'));
        }
    } catch (error) {
        console.error('Error liking/disliking the article:', error);
        res.send(functionsObj.output(0, 'Internal Server Error', null));
    }
}


export default router;
