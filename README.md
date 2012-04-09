css2html
===

Generate HTML from CSS rules. Compatible with **Node.js** and the [jsdom](https://github.com/tmpvar/jsdom) module to serve up your CSS stylesheets as HTML styleguides.

### Features

- Should support all valid CSS selectors: type, universal, attribute, class, id, pseudo, descendant, child, sibling etc.
- Options to populate generated HTML with placeholder content.
- 190+ unit tests with QUnit.

### Syntax

	css2html(css, [options])

### Arguments

1. **css** - (string) CSS rules.
2. **options** - (object, optional) Options object.

### Options

* **autoExpand** - (bool: default `true`) Whether to expand selectors into valid DOM trees. 
* **dataAttr** - (bool: default `false`) Whether to set an HTML5 data attribute 'data-selector' with the value of the CSS selector. 
* **debug** - (bool: default `false`) Whether to log debugging/error messages to a console (if one is available). 
* **out** - (string: default `nodes`) Either 'nodes' to output HTML nodes, or 'html' to output HTML text.
* **populate** - (bool: default `false`) Whether to populate HTML with placeholder text.

### Node.js

To use with Node.js ensure the [jsdom](https://github.com/tmpvar/jsdom) module has been installed and import into your Node.js module:

	var css2html = require('./lib/css2html.js');