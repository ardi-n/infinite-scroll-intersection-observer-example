import Mn from "marionette";
import Radio from "backbone.radio";
import "bootstrap-less/bootstrap/index.less!";

const app = new Mn.Application();
app.on("start", () => {
    const gridChannel = Radio.channel("grid");

    app.gridView = gridChannel.request("collection-view", {el: ".products"});
    app.gridView.render();
    app.sorterView = gridChannel.request("sorter-view", {el: "#daw-grid-sort", gridView: app.gridView});
    app.sorterView.render();
    gridChannel.request("show-more", app.gridView);
});


export default app;