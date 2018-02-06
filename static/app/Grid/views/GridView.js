/** @module */
import "intersection-observer";
import Mn from "marionette";
import "../styles/grid.less!";
import ItemView from "./ItemView";
import AdView from "./AdView";
import LoaderView from "./LoaderView";
import EndView from "./EndView";

function filterMethod(childModel) {
    return !childModel.get("prefetched");
}

/**
 * @class
 * @classdesc View class that is responsible for rendering {@link GridCollection}.
 */
export default Mn.CollectionView.extend({

    /**
     * Based on some logic, decide what view class to return for a child model.
     * @param {Backbone.Model} childModel
     * @returns {AdView|EndView|ItemView}
     */
    childView(childModel) {
        if (childModel.get("isad")) {
            return AdView;
        }
        else if (childModel.get("isend")) {
            return EndView;
        }
        else {
            return ItemView;
        }
    },

    collectionEvents: {
        sync: "onCollectionSync"
    },

    initialize() {
        this.intersectionObserver = new IntersectionObserver(entries => this.processIntersection(entries));
        this.observedEl = null;
        this.resetDefaultFilter();
    },

    onDestroy() {
        this.intersectionObserver.disconnect();
    },
    /**
     * @listens GridCollection#sync
     */
    onCollectionSync() {
        this.resetIntersectionTarget();
    },

    resetDefaultFilter() {
        this.removeFilter();
        this.setFilter(filterMethod);
        this.resetIntersectionTarget();
    },

    resetIntersectionTarget() {
        this.observedEl && this.intersectionObserver.unobserve(this.observedEl);
        const lastView = this.children.last();
        if (lastView) {
            this.observedEl = lastView.el;
            this.intersectionObserver.observe(this.observedEl);
        }
    },

    showLoaderView() {
        let lastView = this.children.last();
        // if it is already shown do nothing
        if (lastView && lastView instanceof LoaderView) return;
        lastView = new LoaderView();
        // append loader view to the end of grid
        this.addChildView(lastView, this.children.length);
        // before first model from a new batch is rendered, remove loader view
        this.once("before:add:child", () => this.removeChildView(lastView));
    },
    /**
     * @fires GridView#last-item-visible
     * @param {IntersectionObserverEntry[]} entries
     */
    processIntersection(entries) {
        const lastItemVisible = 
            !! entries
            // check if last product item has been intersected
            .filter(entry => entry.intersectionRatio > 0)
            // if so, display next batch of products
            .length;

        if (lastItemVisible) {
            this.observedEl && this.intersectionObserver.unobserve(this.observedEl);
            this.trigger("last-item-visible");
        }
    }
});