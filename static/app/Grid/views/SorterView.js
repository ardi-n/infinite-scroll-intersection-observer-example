/** @module */
import Mn from "marionette";

/**
 * @class
 * @classdesc A view that monitors user interaction with sorter widget.
 */
export default Mn.View.extend({

    template: false,

    events: {
        "change": "onChange"
    },

    onChange(e) {
        this.model.set("sortProp", this.$el.val());
    }

});