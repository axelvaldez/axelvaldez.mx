
const { DateTime } = require("luxon");
const pluginRss = require("@11ty/eleventy-plugin-rss");

module.exports = function(eleventyConfig) {
    eleventyConfig.addPassthroughCopy("assets");
    eleventyConfig.addPassthroughCopy("favicon.*");
    eleventyConfig.addPassthroughCopy("admin");
    eleventyConfig.addPassthroughCopy("_redirects");
    eleventyConfig.addFilter("readableDate", dateObj => {
        return DateTime.fromJSDate(dateObj, {zone: 'America/Phoenix'}).toFormat("LLL dd, yyyy");
    });
    eleventyConfig.addCollection("posts", function(collection) {
        return collection.getFilteredByGlob("blog/*.md");
    });
    eleventyConfig.addCollection("stream", function(collection) {
        return collection.getFilteredByGlob("stream/*.md");
    });
    eleventyConfig.addPlugin(pluginRss);
};