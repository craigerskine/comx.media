const { EleventyRenderPlugin } = require("@11ty/eleventy");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const esbuild = require("esbuild");
const markdownIt = require("markdown-it");
const markdownItAttrs = require("markdown-it-attrs");
const yaml = require("js-yaml");

module.exports = function(eleventyConfig) {

  eleventyConfig.setDataFileBaseName('_data');

  eleventyConfig.addPassthroughCopy({
    '_site/_assets/img': '_assets/img',
    '_site/_assets/_root': './',
  });

  eleventyConfig.addWatchTarget('./_site/_app/_app.js');
  
  eleventyConfig.addPlugin(EleventyRenderPlugin);
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  
  //{% renderTemplate "md" %}
  //# Blah{.text-center}
  //{% endrenderTemplate %}
  let markdownLibrary = markdownIt().disable('code').use(markdownItAttrs);
  eleventyConfig.setLibrary('md', markdownLibrary);

  // yaml
  eleventyConfig.addDataExtension('yaml', (contents) => yaml.load(contents));

  // collections
  eleventyConfig.addCollection('comicsByTitle', (collection) => {
    const items = collection.getFilteredByTag('comics');
    const series = items.map(item => item.data.title);
    const uniqueTitle = [...new Set(series)];
    const itemsByTitle = uniqueTitle.reduce((prev, title) => {
      return [
        ...prev,
        [title]
      ]
    }, []);
    return itemsByTitle;
  });
  eleventyConfig.addCollection('magazinesByTitle', (collection) => {
    const items = collection.getFilteredByTag('magazines');
    const series = items.map(item => item.data.title);
    const uniqueTitle = [...new Set(series)];
    const itemsByTitle = uniqueTitle.reduce((prev, title) => {
      return [
        ...prev,
        [title]
      ]
    }, []);
    return itemsByTitle;
  });
  eleventyConfig.addCollection('miscByTitle', (collection) => {
    const items = collection.getFilteredByTag('misc');
    const series = items.map(item => item.data.title);
    const uniqueTitle = [...new Set(series)];
    const itemsByTitle = uniqueTitle.reduce((prev, title) => {
      return [
        ...prev,
        [title]
      ]
    }, []);
    return itemsByTitle;
  });

  // shortcodes
  eleventyConfig.addShortcode('bust', () => `${new Date().getFullYear()}${new Date().getMonth()}${new Date().getDate()}${new Date().getHours()}`);
  eleventyConfig.addShortcode('year', () => `${new Date().getFullYear()}`);
  eleventyConfig.addShortcode('renderblock', function(name) {
    return (this.page.setblock || {})[name] || '';
  });
  eleventyConfig.addPairedShortcode('setblock', function(content, name) {
    if (!this.page.setblock) this.page.setblock = {};
    this.page.setblock[name] = content;
    return '';
  });

  // | randomLimit(6, page.url)
  eleventyConfig.addFilter('randomLimit', (arr, limit, currPage) => {
    const pageArr = arr.filter((page) => page.url !== currPage);
    pageArr.sort(() => {
      return 0.5 - Math.random();
    });
    return pageArr.slice(0, limit);
  });

  // pluck
  eleventyConfig.addFilter("pluck", function (arr, selections, attr) {
    return arr.filter((item) => selections.includes(item.data[attr]));
  });

  // for item in (items | flatMap('category') | unique('category'))
  eleventyConfig.addFilter('flatMap', (list, key) => list.flatMap((x) => x[key]));
  eleventyConfig.addFilter('unique', (list, key) => {
    const map = new Map(list.map((x) => [x[key], x]))
    return [...map.values()]
  });

  // esbuild
  eleventyConfig.on('eleventy.before', async () => {
    await esbuild.build({
      entryPoints: ['_site/_app/_app.js'],
      outfile: 'public/_assets/js/_app.js',
      bundle: true,
      minify: true,
      sourcemap: false,
    });
  });

  return {
    jsDataFileSuffix: '.data',
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dir: {
      input: '_site',
      output: 'public',
    },
  };
};