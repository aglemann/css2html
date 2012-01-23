(function(css2html, root) {
	var defaults = {
	    
	    // Whether to set a data-* attribute with the text selector for a given node.
	    // Intended to be used for presentation or behavior from within the generated HTML.
		dataAttr: false,
		
		// Toggle debug mode and log to the console.
		debug: false,
		
		// What the script should return. Specify either `nodes` to return a DOM fragment or `html` to return a HTML string.
		out: 'nodes',
		
		// Whether the script should populate the generated HTML with placeholder content.
		populate: false
	}

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
		var selectors = parse(css);
		var fragment = createFragment(selectors);
		if (defaults.populate) {
		    populate(fragment);
		}
		return defaults.out === 'html' ? fragment.innerHTML 
			: [].slice.call(fragment.childNodes);
	}

    // createFragment
    // --------------
    // Converts an array of string `selectors` to a matching document `fragment`.
    function createFragment(selectors) {
        var doc = 'document' in this ? document : require('jsdom').jsdom('<html><body /></html>', null, { features: { QuerySelector: true }}),
			fragment = doc.createElement('div'),
			id = css2html + (+new Date);
		fragment.id = id;		
		selectors.sort().forEach(function(selector) {
		    selector = selector.trim();
		    // Split on sibling selectors.
			selector.split(/[+~](?![^\(\[]+[\)\]])/).forEach(function(sibling) { 
				var ancestors = [fragment],
					len = 0; 
					
				// Split on child or descendant selectors.
				sibling.split(/[ >](?![^\[]+[\]])/).forEach(function(element) { 
					len += (len ? 1 : 0) + element.length;
					var substr = sibling.substr(0, len), 
					    nodes = [];
					
					// Test if a node for the element has already been created. 
					// The query looks for the node as a first child of the fragment. 
					// This way `ul` and `nav ul` will always create distinct nodes.
					try {
						nodes = fragment.querySelectorAll('#' + id + '>' + substr);
					}
					catch(error) {
						console.error('querySelectorAll: ' + error);
					}
					if (!nodes.length) {
						nodes = [];
					    node = createNode(element, doc);
					    if (defaults.dataAttr) {
					        node.setAttribute('data-selector', substr);
					    }
					    
                		// Test for various child pseudo selectors and always create enough nodes to match the selector.
                		// Plus one more to illustrate variation.
                		var n = (element.match(/:nth[^(]+\(([^)]+)\)/)); 
                		n = n ? (parseInt(n[1], 10) || 1) + 1
                    		: /:(first|last)-(of|child)/.test(element) ? 2
                    		: /^li/.test(element) ? 2
                			: 1;
						ancestors.forEach(function(ancestor) {
                    		var i = n;
                    		while (i--) {
                    		    var child = node.cloneNode(false);
                    		    
                    		    // Remember the selector for populating the node.
        					    child.__selector__ = substr;
								ancestor.appendChild(child);
                    			nodes.push(child);
                    		}
						});
					}
					ancestors = [].slice.call(nodes);
				});
			});
		});
		return fragment;
    }

    // createNode
    // --------------
    // Converts a string `selector` and document instance `doc` to a matching DOM `node`.
	function createNode(selector, doc) {
		var tag = selector.match(/^\w+/) || ['div'],
			node = doc.createElement(tag[0]);
		
		// Test for an id in the selector, set to the node if matched.
		var id = selector.match(/#(?![^\[]+[\]])([^.:\[]+)/);
		if (id) {
		    node.id = id[1];
		}
		
		// Test for class names in the selector.
		var className = selector.match(/\.(?![^\[]+[\]])[^.:#\[]+/g) || [];
		className = className.join('').replace(/\./g, ' ').trim();

        // Test for attributes in the selector.
		var attributes = selector.match(/\[([^\]'"]+(['"])[^\2]+\2|[^\]'"]+)\]|:(enabled|disabled|checked)/g) || [];
		attributes.forEach(function(attribute) {
		    
		    // Strip colons, brackets and quotes from attributes.
			attribute = attribute.replace(/^[:\[]|['"]|[\]]$/g, ''); 
			
			// Split attributes into name => value pairs.
			var pairs = attribute.split(/[~|\^$*]?=/);
			
			// If the attribute is a class name add to the string of class names.
			if (pairs[0] === 'className') {
			    if (pairs[1]) {
			        className += (className ? ' ' : '') + pairs[1];
			    }
			}
			
			// If the attribute is an id, set to the node.
			else if (pairs[0] === 'id') {
			    if (pairs[1]) {
			        node.id = pairs[1];
			    }
			}
			
			// Otherwise set the attribute to the node.
			else {
				node.setAttribute(pairs[0], pairs[1] || pairs[0]);
			}
		});
		if (className) {
		    node.className = className;
		}
		return node;
	}
	
    // debug
    // --------------
    // Helper for logging to the console.
	function debug(str) {
	    if (defaults.debug && 'console' in this) {
	        console.log(str);
	    }
	}

    // parse
    // --------------
    // Converts a string stylesheet `css` to an array of string `selectors`.
    // Does stuff like normalize syntax, cleanup whitespace and strip comments and un-used selectors.
	function parse(css) {
		var selectors = [];
		css = css
		
		    // Remove line breaks.
		    .replace(/\s+/g, ' ')
		    
	        // Strip comments.
			.replace(/\/\*(.|\n)*?\*\//g, '') 
			
			// Cleanup whitespace.
			.replace(/\s*([,:>+](?![^\[]+[\]]))\s*/g, '$1');
		
		// Split on rules.
		css.split(/\{(?![^\[]+[\]])[^}]*\}/g).forEach(function(rule) {
		    rule = rule.trim();
		    debug('rule: ' + rule);
		    
		    // Ensure the rule is not empty or an @media, @font-face, etc rule.
		    if (!(/^(|@.*)$/).test(rule)) {
		        
		        // Split on multiple selectors.
    			rule.split(/,(?![^\[]+[\]])/).forEach(function(selector) { 
    				selector = selector
    				
    				    // Strip browser specific selectors.
    					.replace(/(:[:\-])(?![^\[]+[\]])[^ >+~]+/g, '') 
    					
    					// Strip pseudo selectors.
    					.replace(/^:root|:(link|visited|active|hover|focus|first-l(etter|ine)|before|after|empty|target)/g, '') 

    					// Properly format attribute selectors.
    					.replace(/\[([^=]+)=([^\]'"]+)\]/, '[$1="$2"]')
    					.trim(); 
    				if (selectors.indexOf(selector) === -1) {
            		    debug('selector: ' + selector);
    				    selectors.push(selector);
    				}
    			});
		    }
		});
		return selectors;
	}
	
    // populate
    // --------------
    // Optionally populates the generated `fragment` with content.
	function populate(fragment) {
	    var nodes = [].slice.call(fragment.childNodes);
	    nodes.forEach(function(node) {
	        if (node.childNodes.length) {
	            populate(node);
	        }
	        else {
	            var selector = node.__selector__;
	            if (/^input/.test(selector)) {
	                node.value = selector;
	            }
	            else if (/^img/.test(selector)) {
	                node.src = selector;
	            }
	            else if (!(/^(area|br|col|hr|param)/).test(selector)) {
    	            node.innerHTML = selector;
	            }
	        }
	    });
	}
})('css2html', this);