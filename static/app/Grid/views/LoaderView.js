/** @module */
import Mn from "marionette";
import "text-spinners/spinners.css!less";
import template from "../templates/loaderview.jst!";

/**
 * @class
 * @classdesc A view that represents a loading indicator when grid products
 * are actively fetched.
 */
export default Mn.View.extend({
    template,
    className: "col-xs-12"
});