import express from "express";
import APIController from '../controller/APIController'


let router = express.Router();

const initAPIRoute = (app) => {
    router.get('/users', APIController.getAllUsers); // GET -> READ
    router.get('/users-detail/:userId', APIController.getDetailPage);
    router.post('/create-user', APIController.createNewUser); // POST -> CREATE
    router.put('/update-user', APIController.updateUser); // PUT -> UPDATE
    router.delete('/delete-user/:userId', APIController.deleteUser); // DELETE -> DELETE
    // create-group
    router.get('/get-group-detail/:group_id', APIController.getGroupDetail);
    router.post('/create-group-detail', APIController.createGroup);
    router.put('/update-single', APIController.updateSingle); // PUT -> UPDATE
    router.delete('/delete-single/:group_id', APIController.deleteSingle); // DELETE -> DELETE

    return app.use('/api/v1/', router);
}

export default initAPIRoute;