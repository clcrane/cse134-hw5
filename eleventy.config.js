module.exports = function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy("css");
    eleventyConfig.addPassthroughCopy("js");
    eleventyConfig.addPassthroughCopy("media");
    eleventyConfig.addPassthroughCopy("resume.pdf");

    return {
        dir: {
            output: "_site"
        }
    };
};