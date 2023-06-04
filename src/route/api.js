import express from "express";
import APIController from '../controller/APIController'


let router = express.Router();

const initAPIRoute = (app) => {
    router.get('/users', APIController.getAllUsers); // GET -> READ
    router.get('/users-detail/:userId', APIController.getDetailPage);
    router.post('/create-user', APIController.createNewUser); // POST -> CREATE
    router.put('/update-user', APIController.updateUser); // PUT -> UPDATE
    router.delete('/delete-user/:userId', APIController.deleteUser); // DELETE -> DELETE

    // authenticate


    return app.use('/api/v1/', router);
}

export default initAPIRoute;