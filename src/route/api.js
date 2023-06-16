import express from "express";
import APIController from '../controller/APIController.js'


let router = express.Router();

const initAPIRoute = (app) => {
    router.get('/get-group-detail/:group_id', APIController.getGroupDetail);
    router.get('/get-date-detail/:date', APIController.getDateDetail);
    router.get('/get-week-detail/:date', APIController.getWeekDetail);
    router.get('/get-undefined-detail', APIController.getUndefinedDetail);
    router.get('/get-usercreated-detail', APIController.getUserCreatedDetail);
    router.get('/get-single-detail/:hidden_id', APIController.getSingleDetail);
    router.post('/create-group-detail', APIController.createGroup);
    router.put('/update-single', APIController.updateSingle); // PUT -> UPDATE
    router.delete('/delete-single/:hidden_id', APIController.deleteSingle); // DELETE -> DELETE

    router.get('/get-ptvh-status/:date', APIController.getPTVHStatus);
    router.get('/get-single-note/:id', APIController.getSingleNote);
    router.get('/get-ptvh-note/:date', APIController.getPTVHNote);
    router.delete('/delete-single-note/:id', APIController.deleteSingleNote);
    return app.use('/api/v1/', router);
}

export default initAPIRoute;