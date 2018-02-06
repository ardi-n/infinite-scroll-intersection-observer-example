/** @module */
import Bb from "backbone";

/**
 * @class
 * @classdesc A model that holds some information about current state of the grid.
 */
export default Bb.Model.extend({
    defaults: {
        nextPage: 1,
        perPage: 12,
        sortProp: ""
    },

    getNextPage() {
        return this.get("nextPage");
    },

    setNextPage(v) {
        this.set("nextPage", v);
    },

    incNextPage() {
        this.setNextPage(this.getNextPage()+1);
    },

    getPerPage() {
        return this.get("perPage");
    },

    isPrefetching(v) {
        if (typeof v === "boolean") {
            this.set("isPrefetching", v);
        }
        else {
            return this.get("isPrefetching");
        }
    },

    getSortProp() {
        return this.get("sortProp");
    },
    setSortProp(v) {
        this.set("sortProp", v);
    }
});