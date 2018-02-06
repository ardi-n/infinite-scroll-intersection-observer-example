import Mn from "marionette";
import GridManager from "./GridManager";

const app = new Mn.Application();
app.on("start", () => {
    app.gridManager = new GridManager();
});

export default app;