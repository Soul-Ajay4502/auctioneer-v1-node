import { Router } from "express";
import { authentication } from "../controller/auth.controller.js";
import { metaController } from "../controller/meta.controller.js";

const metaRouter = Router();

// metaRouter.use(authentication)

metaRouter.route("/get-league/:uuid").get(metaController.getLeagueByUuid);

export default metaRouter;
