import express from "express";
import APIController from '../controller/APIController.js'


let router = express.Router();

const initAPIRoute = (app) => {
    router.get('/get-group-detail/:group_id', checkAuthenticated, APIController.getGroupDetail);
    router.get('/get-date-detail/:date', checkAuthenticated, APIController.getDateDetail);
    router.get('/get-week-detail/:date', checkAuthenticated, APIController.getWeekDetail);
    router.get('/get-undefined-detail', checkAuthenticated, APIController.getUndefinedDetail);
    router.get('/get-usercreated-detail', checkAuthenticated, APIController.getUserCreatedDetail);
    router.get('/get-usercreated-date-detail/:date', checkAuthenticated, APIController.getUserCreatedDateDetail);
    router.get('/get-usercreated-week-detail/:date', checkAuthenticated, APIController.getUserCreatedWeekDetail);
    router.get('/get-single-detail/:hidden_id', checkAuthenticated, APIController.getSingleDetail);
    router.post('/create-group-detail', checkAuthenticated, APIController.createGroup);
    router.put('/update-single', checkAuthenticated, APIController.updateSingle); // PUT -> UPDATE
    router.delete('/delete-single/:hidden_id', checkAuthenticated, APIController.deleteSingle); // DELETE -> DELETE

    router.get('/get-ptvh-status/:date', checkAuthenticated, APIController.getPTVHStatus);
    router.get('/get-single-note/:id', checkAuthenticated, APIController.getSingleNote);
    router.get('/get-ptvh-note/:date', checkAuthenticated, APIController.getPTVHNote);
    router.put('/lock-ptvh', checkAuthenticated, APIController.lockPTVH);
    router.delete('/delete-single-note/:id', checkAuthenticated, APIController.deleteSingleNote);
    return app.use('/api/v1/', router);
}

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

export default initAPIRoute;