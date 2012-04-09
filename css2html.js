(function(css2html, root) {
    var doc = 'document' in this ? document 
            : require('jsdom').jsdom('<html><body /></html>', null, { features: { QuerySelector: true }}),
		parserlib = root.parserlib || require('parserlib'),
		fragment = doc.createElement('div'),
		id = css2html + (+new Date),
		parser = new parserlib.css.Parser(),
		defaults = {
            
            // Automatically expand selectors into valid DOM trees. 
            // For example, a selector `li` would create a DOM tree of `UL > LI`.
            // A selector `div td a` would create a DOM tree of `DIV > TABLE > TBODY > TR > TD > A`.
            autoExpand: true,

    	    // Whether to set a data-* attribute with the text selector for a given node.
    	    // Intended to be used for presentation or behavior from within the generated HTML.
    		dataAttr: false,

    		// Toggle debug mode and log to the console.
    		debug: false,

    		// What the script should return. Specify either `nodes` to return a DOM fragment or `html` to return a HTML string.
    		out: 'nodes',

    		// Whether the script should populate the generated HTML with placeholder content.
    		populate: false
    	};
    
    fragment.id = id;
    parser.addListener('startrule', parseRuleSet);
    parser.addListener('error', parseError);

    // Test if we're running server-side.
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            root = module;
        }
        css2html = 'exports';
    }
    
    // css2html
    // --------------
    // Return the public API. 
    // Takes a `css` stylesheet string and optional `options` object with one or more of the properties described in the `defaults`.
	root[css2html] = function(css, options) {
	    options || (options = {});
		for (var prop in options) {
            if (options[prop] !== void 0) defaults[prop] = options[prop];
        }
        fragment.innerHTML = '';
        parser.parse(css);
        if (defaults.populate) {
            populate(fragment);
        }
		return defaults.out === 'html' ? fragment.innerHTML 
			: [].slice.call(fragment.childNodes);
	}

    // createNode
    // --------------
    // Converts a SelectorPart `part` into a DOM `node`.
	function createNode(part) {
	    var node = doc.createElement(tagName(part));
	    part.modifiers.forEach(function(modifier) {
            var text = modifier.text;
            switch (modifier.type) {
                case 'attribute':
                
                    // Test for `[attr]` selector.
                    if (/^\[([^=]+)\]$/.test(text)) {
                        node.setAttribute(RegExp.$1, RegExp.$1);                        
                    }
                    
                    // Test for `[attr="value"]` selector.
                    else if (/^\[([^=]+?)[~|^$*]?=(.+)\]$/.test(text)) {
					    var attr = RegExp.$1,
					        value = RegExp.$2.replace(/^['"]|['"]$/g, '');
					        
                        // If the attribute is a class name add to the string of class names.
                        if (attr === 'className') {
                            node.className += (node.className ? ' ' : '') + value;
                        }

                        // If the attribute is an id, set to the node.
                        else if (attr === 'id') {
                            node.id = value;
                        }

                        // Otherwise set the attribute to the node.
                        else {
                            node.setAttribute(attr, value);
                        }					
					}
                    break;
                case 'class':
                    node.className += (node.className ? ' ' : '') + text.substr(1);
                    break;
                case 'id':    
                    node.id = text.substr(1);
                    break;
                case 'pseudo':
                
                    // Test for `:lang(code)` pseudo class.
    			    if (/^:lang\((\w{2})\)$/.test(text)) {
                        node.setAttribute('lang', RegExp.$1);    			        
    			    }
    			    
    			    // Test for other supported psuedo classes.
    			    else if (/^:(checked|default|disabled|enabled|indeterminate|invalid|optional|required|valid)$/.test(text)) {
                        node.setAttribute(RegExp.$1, RegExp.$1);    			        
    			    }                
                    break;
            }
        });
		return node;
	}
	
    // expand
    // --------------
    // Expand selectors into valid DOM trees. 
	function expand(parts) {
	    var relations = {
                caption: 'table', command: 'menu', dd: 'dl', dt: 'dl', figcaption: 'figure', li: 'ul', option: 'select', summary: 'details', td: 'tr', th: 'tr', tr: 'tbody', tbody: 'table', tfoot: 'table', thead: 'table'
            },
            expandedParts = [],
            parent,
            child,
            relation,
            missing;
	    parts.forEach(function(part) {
            if (part instanceof parserlib.css.SelectorPart) {
	            parent = child;
	            child = tagName(part);
	            relation = relations[child];
	            missing = [];
	            while (relation && relation != parent) {
	                missing.push(new parserlib.css.Combinator('>'));
	                missing.push(new parserlib.css.SelectorPart({ text: relation }, [], relation));
	                parent = relation;
	                relation = relations[relation];
	            }
	            expandedParts.push.apply(expandedParts, missing.reverse());
	        }
	        expandedParts.push(part);
	    });
	    return expandedParts;
	}
	
    // parseError
    // --------------
    function parseError(error) {
        report(error.message);
    }

    // parseRuleSet
    // --------------
    // Parses a `ruleset` collection of selectors, creating DOM nodes.
	function parseRuleSet(ruleset) {
	    ruleset.selectors.forEach(function(selector) {
	        var queryString = '',
	            nodes = [],
	            targets = [fragment],
	            parts = defaults.autoExpand ? expand(selector.parts) : selector.parts;
	        parts.forEach(function(part) {
	            var text = part.text

        		    // Strip browser specific selectors.
        			.replace(/(:[:\-])(?![^\[]+[\]])[^ >+~]+/g, '') 

        			// Strip pseudo elements and classes.
        			.replace(/:(active|after|before|empty|first-letter|first-line|focus|hover|link|visited)(?![^\[]+[\]])/g, '') 

                    // Strip html (root) and body selectors.
                    .replace(/^((:root|html)([ >]body|)|body)/g, '');
                if (!text) {
                    return;
                }
	            queryString += text;
	            if (part instanceof parserlib.css.SelectorPart) {
					try {
						nodes = fragment.querySelectorAll('#' + id + '>' + queryString);
					}
					catch(error) {
					    error.queryString = queryString;
						report(error);
					}
					if (!nodes.length) {
					    var node = createNode(part);
					    if (defaults.dataAttr) {
					        node.setAttribute('data-selector', queryString);
					    }
					    
					    // Test for various child pseudo classes and ensure enough nodes exist to match the selectors.
                		// Plus one more to illustrate variation.
    					var n = (text.match(/:nth[^(]+\(([^)]+)\)(?![^\[]+[\]])/));
                		n = n ? (parseInt(n[1], 10) || 1) + 1
                    		: /:(first|last)-(of|child)(?![^\[]+[\]])/.test(text) ? 2
                			: 1;
    					nodes = [];
    					targets.forEach(function(target) {
                    		var i = n;
                    		while (i--) {
                    		    var clone = node.cloneNode(false);

                    		    // Remember the selector for populating the node.
        					    clone.__selectorPart__ = text;
    							target.appendChild(clone);
                    			nodes.push(clone);
                    		}
    					});
					}
	            }
	            else if (part instanceof parserlib.css.Combinator) {
                    if (/[> ]/.test(text)) {
                        
                        // If it's a `descendant` or `child` combinator 
                        // then the current nodes become the next targets.
                        targets = [].slice.call(nodes);
                    }
	            }
	        });
	    });
	}
	
    // populate
    // --------------
    // Optionally populates the leaf nodes of a fragment with content.
	function populate(node) {
	    var childNodes = [].slice.call(node.childNodes);
	    childNodes.forEach(function(childNode) {
	        if (childNode.childNodes.length) {
	            populate(childNode);
	        }
	        else {
	            var part = childNode.__selectorPart__,
	                tag = childNode.tagName;
	            if ((/input/i).test(tag)) {
	                childNode.value = part;
	            }
	            else if ((/img/i).test(tag)) {
	                childNode.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEX///+nxBvIAAAAAXRSTlMAQObYZgAAABJJREFUeF4FwIEIAAAAAKD9qY8AAgABdDtSRwAAAABJRU5ErkJggg==';
	            }
	            else if (!(/(area|br|col|hr|param)/i).test(tag)) {
    	            childNode.innerHTML = part;
	            }
	        }
	    });
	}
	
	// report
    // --------------
    // Helper for logging to the console.
	function report(message) {
	    if (defaults.debug && 'console' in this) {
	        console.log(message);
	    }
	}
	
	// tagName
    // --------------
    // Helper for parsing out the tagName of a selector part.
	function tagName(part) {
	    var tag = part.elementName && part.elementName !== '*' ? part.elementName.text : 'div';
	    return tag.toLowerCase();
	}
})('css2html', this);