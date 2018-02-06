/** @module */
import Bb from "backbone";

/**
 * @typedef FetchData
 * @type {Object}
 * @property {string} sort   Can be id|price|size or ""
 * @property {number} limit  A number of items to fetch
 * @property {number} skip   How many items to skip?
 */

/**
 * @class
 * @classdesc Models a collection of grid products.
 */
export default Bb.Collection.extend({

    url: "api/products",

    initialize(models, opts) {
        this._fetchPromise = null;
        this._fetchNextAdUrlPromise = null;
        this.gridModel = opts.gridModel;
        this.on("add", this.onAdd);
    },
    /**
     * Called on every model addition to the collection.
     * Ensures every ad has url set eventually.
     * @param {Backbone.Model} model
     * @listens GridCollection#add
     */
    onAdd(model) {
        if (model.get("isad")) {
            this.fetchNextAdUrl().then(url => model.set("url", url));
        }
    },
    /**
     * Parses server response to return JSON objects found in it to the collection.
     * @param {string} resp A newline-separated list of JSON objects.
     * @param {Object} opts The same object that {@link module:Grid/models/GridCollection#fetchWithParams}
     * got called with.
     * @returns {Object[]}
     */
    parse(resp, opts) {
        // records are newline-delimited
        const records = resp.split("\n")
            // filter out empty rows
            .filter(row => !! row)
            .map(row => JSON.parse(row));

        if (records.length === 0) {
            records.push({isend: true});
        }
        else {
            // check if we need to insert an ad
            if (typeof opts.adAt !== "undefined" && records.length >= opts.adAt) {
                records.splice(opts.adAt, 0, {isad: true, url: ""});
            } 
        }

        records.forEach(record => {
            record.page = opts.nextPage;
            this.gridModel.isPrefetching() && (record.prefetched = true);
        });

        return records;
    },
    /**
     * @returns {Backbone.Model[]}
     */
    getPrefetched() {
        return this.where({prefetched: true});
    },
    /**
     * @returns {boolean}
     */
    hasPrefetched() {
        return this.getPrefetched().length > 0;
    },
    /**
     * 
     */
    makePrefetchedAvailable() {
        this.getPrefetched().forEach(item => item.unset("prefetched"));
    },
    /**
     * @returns {boolean}
     */
    hasEnded() {
        return !!this.findWhere({isend: true});
    },
    /**
     * @returns {Backbone.Model[]}
     */
    getAds() {
        return this.where({isad: true});
    },
    /**
     * @returns {number}
     */
    getLastAdIndex() {
        return this.findLastIndex(model => model.get("isad"));
    },
    /**
     * At any given time, one and only one collection fetch can happen. This
     * method acts like a guard.
     * @param {Object} opts
     * @param {FetchData} opts.data
     * @param {number} opts.nextPage
     * @param {number} [opts.adAt]
     * @returns {Promise} Just started or currently running fetch as promise.
     */
    fetchWithParams(opts = {}) {
        if (this.hasEnded()) {
            return Promise.resolve();
        }
        if (! this._fetchPromise) {
            this._fetchPromise = this.fetch(Object.assign({
                // it's not a typical json response - records are newline-delimited
                // overwrite default options passed by Backbone to jQuery
                dataType: "text",
                remove: false
            }, opts))
            .then(() => {
                this._fetchPromise = null;
                this.gridModel.incNextPage();
            });
        }
        return this._fetchPromise;
    },
    /**
     * @returns {boolean}
     */
    isFetching() {
        return !!this._fetchPromise;
    },
    /**
     * Returns a promise that resolves into an external url pointing at an ad.
     * Ensures that only one ad request is running at any given time.
     * @returns {Promise}
     */
    fetchNextAdUrl() {
        if (this._fetchNextAdUrlPromise) {
            // let previous request finish - we need to be able to determine
            // if prev url equals newly generated
            return this._fetchNextAdUrlPromise.then(() => this.fetchNextAdUrl());
        }
        // find last ad that has url already set
        const prevAdIndex = this.findLastIndex(model => model.get("isad") && model.get("url"));
        const prevAdUrl = prevAdIndex > -1 && this.at(prevAdIndex).get("url");
        const req = new Request("/ad/?r=" + Math.floor(Math.random()*1000));
        this._fetchNextAdUrlPromise = 
            fetch(req)
            .then(resp => (this._fetchNextAdUrlPromise = null) || resp)
            .then(resp => resp.url == prevAdUrl ? this.fetchNextAdUrl() : resp.url);
        
        return this._fetchNextAdUrlPromise;
    }
});