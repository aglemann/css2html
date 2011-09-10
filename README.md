css2html
===

Generate HTML from CSS rules, in 3k of Javascript. Compatible with **Node.js** and the [jsdom](https://github.com/tmpvar/jsdom) module to serve up your CSS stylesheets as HTML styleguides.

### Features

- Supports type, universal, attribute, class, id, pseudo, descendant, child and sibling selectors.
- Options to populate generated HTML with placeholder content.
- 180 unit tests with QUnit.

### Syntax

	css2html(css, [options])

### Arguments

1. **css** - (string) CSS rules.
2. **options** - (object, optional) Options object.

### Options

* **dataAttr** - (bool: default true) Whether to set an HTML5 data attribute 'data-selector' with the value of the CSS selector. 
* **expand** - (object: see source for defaults) A map of tags abbreviations and expansions to use with the 'populate' option. For example { p: 'paragraph' }. Any values here will extend the existing defaults.
* **out** - (string: default nodes) Either 'nodes' to output HTML nodes, or 'html' to output HTML text.
* **populate** - (bool: default false) Whether to populate HTML with placeholder text.
* **tags** - (array: see source for default) An array of string or RegExp patterns to use with the 'populate' option. The script will attempt to match the node tag name, then class names, against this array when deciding whether to populate the node. A value here will replace the existing default.

### Preprocessing

The parser has support for optional preprocessor directives included in a valid CSS comment before a given selector:

* **@abstract** - Tells the parser to skip the following selector as it is not intended to be used directly in the HTML, but rather extended by additional selectors:

	/* @abstract */
	.button-icon { position: relative; }

### Node.js

To use with Node.js change the last line from:

	})('css2html', this);

To:

	})('exports', module);

Import into your Node.js module, for example:

	var css2html = require('./lib/css2html.js');