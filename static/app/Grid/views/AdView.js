/** @module */
import Mn from "marionette";
import template from "../templates/adview.jst!";

/**
 * @class
 * @classdesc View class that represents an ad in a grid.
 */
export default Mn.View.extend({
    template,

    className: "col-xs-12 col-sm-6 col-md-4",

    modelEvents: {
        "change:url": "onModelChangeUrl"
    },

    onModelChangeUrl(model, url) {
        this.render();
    }
});