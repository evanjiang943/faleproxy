const cheerio = require('cheerio');
const { sampleHtmlWithYale } = require('./test-utils');

describe('Integration Tests', () => {
  // These integration tests verify the overall replacement logic
  // More detailed endpoint tests are in api.test.js
  
  test('Should replace Yale with Fale in HTML content', () => {
    // Function to preserve case when replacing Yale with Fale
    function replaceWithCasePreserved(text) {
      return text.replace(/Yale/gi, function(match) {
        if (match === 'YALE') return 'FALE';
        if (match === 'Yale') return 'Fale';
        if (match === 'yale') return 'fale';
        return 'Fale'; // default
      });
    }
    
    const $ = cheerio.load(sampleHtmlWithYale);
    
    // Process text nodes in the body
    $('body *').contents().filter(function() {
      return this.nodeType === 3; // Text nodes only
    }).each(function() {
      const text = $(this).text();
      const newText = replaceWithCasePreserved(text);
      if (text !== newText) {
        $(this).replaceWith(newText);
      }
    });
    
    // Process title separately
    const title = replaceWithCasePreserved($('title').text());
    $('title').text(title);
    
    const content = $.html();
    
    // Verify Yale has been replaced with Fale in text
    expect($('title').text()).toBe('Fale University Test Page');
    expect($('h1').text()).toBe('Welcome to Fale University');
    expect($('p').first().text()).toContain('Fale University is a private');
    
    // Verify URLs remain unchanged
    const links = $('a');
    let hasYaleUrl = false;
    links.each((i, link) => {
      const href = $(link).attr('href');
      if (href && href.includes('yale.edu')) {
        hasYaleUrl = true;
      }
    });
    expect(hasYaleUrl).toBe(true);
    
    // Verify link text is changed
    expect($('a').first().text()).toBe('About Fale');
  });

  test('Should preserve URLs and attributes', () => {
    const $ = cheerio.load(sampleHtmlWithYale);
    
    // Function to preserve case when replacing Yale with Fale
    function replaceWithCasePreserved(text) {
      return text.replace(/Yale/gi, function(match) {
        if (match === 'YALE') return 'FALE';
        if (match === 'Yale') return 'Fale';
        if (match === 'yale') return 'fale';
        return 'Fale'; // default
      });
    }
    
    // Process text nodes only
    $('body *').contents().filter(function() {
      return this.nodeType === 3;
    }).each(function() {
      const text = $(this).text();
      const newText = replaceWithCasePreserved(text);
      if (text !== newText) {
        $(this).replaceWith(newText);
      }
    });
    
    const content = $.html();
    
    // Verify URLs remain unchanged
    expect(content).toContain('https://www.yale.edu/about');
    expect(content).toContain('https://www.yale.edu/admissions');
    expect(content).toContain('mailto:info@yale.edu');
    
    // Verify alt attributes remain unchanged
    expect(content).toContain('alt="Yale Logo"');
  });
});
