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

	function create(selector, doc){
		var tag = selector.match(/^\w+/) || ['div'],
			node = doc.createElement(tag[0]),
			id = selector.match(/#(?![^\[]+[\]])([^.:\[]+)/);
		if (id)
			node.id = id[1];

		var className = selector.match(/\.(?![^\[]+[\]])[^.:#\[]+/g) || [];
		className = className.join('').replace(/\./g, ' ').trim();

		var attributes = selector.match(/\[([^\]'"]+(['"])[^\2]+\2|[^\]'"]+)\]|:(enabled|disabled|checked)/g) || [];
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
				node.setAttribute(pairs[0], pairs[1] || pairs[0]);
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
		var doc = 'document' in this ? document : require('jsdom').jsdom('<html><body></body></html>', null, { features: { QuerySelector: true }}),
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
					.replace(/(:[:\-])(?![^\[]+[\]])[^ >+~]+/g, '') // strip browser specific selectors
					.replace(/:(link|visited|active|hover|focus|first-l(etter|ine)|before|after|empty|target)/g, '') // strip pseudo selectors
					.replace(/\[([^=]+)=([^\]'"]+)\]/, '[$1="$2"]'); // properly format attribute selectors 
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
					parentNodes = slice(nodes);
				});
			});
		});	

		return fragment;
	}

	function populate(node){
		var tags = (node.tagName + ' ' + node.className).toLowerCase().split(/[ -_]/),
			re = new RegExp('^(' + options.tags.join('|') + ')$');
			
		for (var i = 0, len = tags.length, tag; i < len; i++){
			if (re.test(tag = tags[i])){
				tag = options.expand[tag] || tag;
		 		node.innerHTML = tag.replace(/\b[a-z]/g, function(match){ return match.toUpperCase(); }); // capitalize
				break;
			}
		}
	}
	
	function setOptions(opts){
		options.out = opts.out || options.out;
		options.populate = opts.populate || options.populate;
		
		if (typeof opts.expand == 'object'){
			for (var i in opts.expand)
				options.expand[i] = opts.expand[i];
		}
		
		if (opts.tags instanceof Array)
			options.tags = opts.tags;
	}
	
	function slice(collection){
		return [].slice.call(collection);
	}

	container[css2html] = function(css, opts){
		setOptions(opts || {});

		var fragment = parse(css);
		return options.out == 'html' ? fragment.innerHTML 
			: slice(fragment.childNodes);
	}
})('css2html', this);