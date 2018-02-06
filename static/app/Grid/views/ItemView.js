/** @module */
import Mn from "marionette";
import template from "../templates/itemview.jst!";

const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;

/**
 * @class
 * @classdesc View that renders a product returned by the server API in a grid.
 */
export default Mn.View.extend({
    template,

    className: "col-xs-12 col-sm-6 col-md-4",

    templateContext() {
        
        return {
            priceInDollars: this.getPriceInDollars(),
            relativeDate: this.getRelativeDate()
        };
    },

    getPriceInDollars() {
        const p = this.model.get("price");
        const dollars = Math.floor(p / 100);
        let cents = p % 100;
        if (cents < 10) {
            cents = "0"+cents;
        }
        return dollars+"."+cents;
    },

    getRelativeDate() {
        const d = new Date(this.model.get("date"));
        const millisSinceEpoch = d.getTime();
        const diffInSecs = (Date.now() - millisSinceEpoch) / 1000;
        let computed = "";
        if (diffInSecs > WEEK) {
            computed = d.getFullYear() +"/"+ (d.getMonth()+1) +"/"+ d.getDate();
        }
        else if (diffInSecs > DAY) {
            computed = Math.floor(diffInSecs / DAY) + " day(s) ago";
        }
        else if (diffInSecs > HOUR) {
            computed = Math.floor(diffInSecs / HOUR) + " hour(s) ago";
        }
        else if (diffInSecs > MINUTE) {
            computed = Math.floor(diffInSecs / MINUTE) + " minute(s) ago";
        }
        else {
            computed = Math.floor(diffInSecs) + " second(s) ago";
        }

        return computed;
    }
});