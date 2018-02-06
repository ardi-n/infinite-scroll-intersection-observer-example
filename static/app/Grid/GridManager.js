/** @module */
import Mn from "marionette";
import "intersection-observer";
import GridView from "./views/GridView";
import SorterView from "./views/SorterView";
import GridModel from "./models/GridModel";
import GridCollection from "./models/GridCollection";

const NB_ITEMS_BETWEEN_ADS = 20;

/**
 * @class
 * @classdesc The sole purpose of this class is to hold the state of grid 
 * in instances of {@link GridModel} and {@link GridCollection} and create and manage
 * view instances of {@link GridView} and {@link SorterView}.
 * @listens collection-view in grid channel
 * @listens sorter-view in grid channel
 * @listens show-more in grid channel
 */
export default Mn.Object.extend({
    channelName: "grid",

    radioRequests: {
        "collection-view": "getView",
        "sorter-view": "getSorterView",
        "show-more": "showMore"
    },

    initialize() {
        this.model = new GridModel();
        this.collection = new GridCollection(null, {gridModel: this.model});
    },
    /**
     * @listens GridView#last-item-visible
     * @param {Object} opts
     * @param {HTMLElement} opts.el
     * @returns {GridView}
     */
    getView(opts = {}) {
        if (! opts.el) throw new Error("No el provided to GridManager.getView.");
        opts.collection = this.collection;
        opts.model = this.model;
        let v = new GridView(opts);
        v.on("last-item-visible", () => this.showMore(v));
        return v;
    },
    /**
     * Sorts out the parameters required to make a request, like products per page,
     * next page number, sort property, how many items to skip and
     * at what index an ad should be displayed. Then delegates the call to the collection.
     * @returns {Promise} 
     */
    fetch() {
        const pp = this.model.getPerPage();
        const nextPage = this.model.getNextPage();
        const skip = this.collection.length - this.collection.getAds().length;
        // GET query params 
        const data = {
            sort: this.model.getSortProp(),
            limit: pp,
            skip
        };
        const opts = {data, nextPage};
        const lastAdIndex = this.collection.getLastAdIndex();
        const nextAdIndex = lastAdIndex + 1 + NB_ITEMS_BETWEEN_ADS;
        const relativeAdIndex = nextAdIndex - this.collection.length;
        if (relativeAdIndex < pp) {
            // should place next ad in this new batch
            opts.adAt = relativeAdIndex;
            // fetch one item less
            opts.data.limit -= 1;
        }

        return this.collection.fetchWithParams(opts)
            .catch(e => console.warn(e));
    },
    /**
     * @param {GridView} gridView
     */
    showMore(gridView) {
        if (! (gridView instanceof GridView)) {
            throw new Error("GridManager.showMore: provided view is not an instance of GridView.");
        }
        if (this.collection.hasEnded()) {
            // ensure "~ end of catalogue ~" is shown
            this.collection.makePrefetchedAvailable();
            // efficiently render ommitted models
            gridView.resetDefaultFilter();
            return;
        }

        if (this.collection.hasPrefetched()) {
            this.collection.makePrefetchedAvailable();
            // efficiently render ommitted models
            gridView.resetDefaultFilter();
            // start prefetching
            this.model.isPrefetching(true);
            this.fetch();
        }
        else if (this.collection.isFetching()) {
            // ensure loader is shown
            gridView.showLoaderView();
            if (this.model.isPrefetching()) {
                // make current request non-prefetching to render immediately
                this.model.isPrefetching(false);
                this.fetch().then(() => {// enqueue prefetching
                    this.model.isPrefetching(true);
                    this.fetch();
                });
            }
        }
        else {// no prefetched nor fetching
            // ensure loader is shown
            gridView.showLoaderView();
            this.model.isPrefetching(false);
            // start fetching and immediately rendering
            this.fetch().then(() => {// next enqueue prefetching
                this.model.isPrefetching(true);
                this.fetch();
            });
        }
    },
    /**
     * @param {Object} opts
     * @param {HTMLElement} opts.el
     * @param {GridView} opts.gridView
     * @returns {SorterView}
     */
    getSorterView(opts = {}) {
        if (! opts.el) throw new Error("No el provided to GridManager.getSorterView.");
        if (! opts.gridView) throw new Error("No gridView provided to GridManager.getSorterView.");
        opts.model = this.model;
        let v = new SorterView(opts);
        v.listenTo(this.model, "change:sortProp", () => {
            this.model.setNextPage(1);
            this.collection.reset();
            this.showMore(opts.gridView);
        });
        return v;
    }
});