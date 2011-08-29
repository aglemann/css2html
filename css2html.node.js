(function(css2html, container){
	var options = {
		expand: { 
 			a: 'anchor', dd: 'description', del: 'deleted', dfn: 'definition', dl: 'definition list', dt: 'term', em: 'emphasized', 
			h1: 'heading', h2: 'heading', h3: 'heading', h4: 'heading', h5: 'heading', h6: 'heading', ins: 'inserted', li: 'item', 
			ol: 'ordered list', p: 'paragraph', pre: 'preformatted', q: 'quotation', sub: 'subscript', sup: 'superscript', 
			td: 'data cell', th: 'header cell', ul: 'unordered list' 		
		},
		out: 'nodes',
		populate: false,
		tags: [
			'a', 'abbr', 'address', 'big', 'blockquote', 'button', 'caption', 'cite', 'code', 'dd', 'del', 'dfn', 'dt', 'em', 'h\\d', 
			'ins', 'kbd', 'label', 'legend', 'li', 'mark', 'option', 'p', 'pre', 'q', 'small', 'span', 'strong', 'sub', 'sup', 'td', 
			'textarea', 'th', 'tt', 'var'
		]
	}

	function arrayize(collection){
		return [].slice.call(collection);
	}

	function create(selector, doc){
		var tag = selector.match(/^\w+/) || ['div'],
			node = doc.createElement(tag[0]),
			id = selector.match(/#(?![^\[]+[\]])([^.:\[]+)/);
		if (id)
			node.id = id[1];

		var className = selector.match(/\.(?![^\[]+[\]])[^.:#\[]+/g) || [];
		className = className.join('').replace(/\./g, ' ').trim();

		var attributes = selector.match(/\[([^'"]+(['"])[^\2]+\2|[^\]'"]+)\]|:(enabled|disabled|checked)/g) || [];
		attributes.forEach(function(attribute){
			attribute = attribute.replace(/^[:\[]|['"]|[\]]$/g, ''); // strip colons, brackets and quotes
			var pairs = attribute.split(/[~|\^$*]?=/); // split into pairs
			if (pairs[0] == 'className'){
				if (pairs[1])
					className += (className ? ' ' : '') + pairs[1];
			}
			else if (pairs[0] == 'id'){
				if (pairs[1])
					node.id = pairs[1];
			}
			else
				node[pairs[0]] = pairs[1] || pairs[0];
		});

		if (className)
			node.className = className;

		var n = (selector.match(/:nth[^(]+\(([^)]+)\)/)); // test for child pseudo selectors
		n = n ? (parseInt(n[1], 10) || 1) + 1
			: (/:(first|last)-(of|child)/.test(selector)) ? 2
			: 1;

		var array = [];
		while (n--){
			var clone = node.cloneNode(false);
			options.populate && populate(clone);
			array.push(clone);
		}
		return array;
	}

	function parse(css){
		var doc = document || require('jsdom').jsdom('<html><body></body></html>', null, { features: { QuerySelector: true }}),
			fragment = doc.createElement('div'),
			selectors = [];

		css = css
			.replace(/\s+/g, ' ') // remove line breaks
			.replace(/\/\*(.|\n)*?\*\//g, ''); // strip comments
		css.split(/\{(?![^\[]+[\]])[^}]*\}/g).forEach(function(rule, i){
			rule = rule.replace(/\s*([,:>+](?![^\[]+[\]]))\s*/g, '$1').trim(); // cleanup whitespace
			if (!rule)
				return;
			rule.split(/,(?![^\[]+[\]])/).forEach(function(selector){ // separate by commas
				selector = selector
					.replace(/::(?![^\[]+[\]])[^ >+~]+/, '') // strip browser specific selectors
					.replace(/:(link|visited|active|hover|focus|first-l(etter|ine)|before|after|empty|target)/, ''); // strip pseudo selectors
				if (selectors.indexOf(selector) == -1)
					selectors.push(selector);
			});
		});

		selectors.sort().forEach(function(selector){
			selector.split(/[+~](?![^\(\[]+[\)\]])/).forEach(function(sibling){ // separate by plus or tilde
				var parentNodes = [fragment],
					len = 0; 
				sibling.split(/[ >](?![^\[]+[\]])/).forEach(function(element){ // separate by space or angle bracket
					len += (len ? 1 : 0) + element.length;
					var substr = sibling.substr(0, len),
						nodes = [];
					try {
						nodes = fragment.querySelectorAll(substr);
					}
					catch(e){
						console.error(e);
					}
					if (!nodes.length){
						nodes = create(element, doc);
						parentNodes.forEach(function(parentNode){
							nodes.forEach(function(node){
								node.setAttribute('data-selector', substr);
								parentNode.appendChild(node);
							});
						});
					}
					parentNodes = arrayize(nodes);
				});
			});
		});	

		return fragment;
	}

	function populate(node){
		var tag = node.tagName.toLowerCase(),
			re = new RegExp('^(' + options.tags.join('|') + ')$');
			
		if (re.test(tag)){
			tag = options.expand[tag] || tag;
	 		node.innerHTML = tag.replace(/\b[a-z]/g, function(match){ return match.toUpperCase(); }); // capitalize
		}
	}
	
	container[css2html] = function(css, opts){
		opts = opts || {};
		for (var i in opts)
			options[i] = opts[i];

		var fragment = parse(css);
		return options.out == 'html' ? fragment.innerHTML 
			: arrayize(fragment.childNodes);
	}
})('exports', module);