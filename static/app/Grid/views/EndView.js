/** @module */
import Mn from "marionette";
import template from "../templates/endview.jst!";

/**
 * @class
 * @classdesc View class that renders the "end of catalogue" message when server 
 * has no more items.
 */
export default Mn.View.extend({
    template,

    className: "col-xs-12"
});