(function(css2html, container){
	var defaults = {
		dataAttr: true,
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
			defaults.populate && populate(clone);
			array.push(clone);
		}
		return array;
	}

	function parse(css){
		var doc = 'document' in this ? document : require('jsdom').jsdom('<html><body></body></html>', null, { features: { QuerySelector: true }}),
			fragment = doc.createElement('div'),
			abstracts = [],
			selectors = [];


		css = css.replace(/\s+/g, ' '); // remove line breaks
		css.split(/\{(?![^\[]+[\]])[^}]*\}/g).forEach(function(rule, i){
			var isAbstract = /\/\*[^@]*@abstract/.test(rule);
			rule = rule
				.replace(/\/\*(.|\n)*?\*\//g, '') // strip comments
				.replace(/\s*([,:>+](?![^\[]+[\]]))\s*/g, '$1') // cleanup whitespace
				.trim(); 
			if (!rule)
				return;
			rule.split(/,(?![^\[]+[\]])/).forEach(function(selector){ // separate by commas
				selector = selector
					.replace(/(:[:\-])(?![^\[]+[\]])[^ >+~]+/g, '') // strip browser specific selectors
					.replace(/:(link|visited|active|hover|focus|first-l(etter|ine)|before|after|empty|target)/g, '') // strip pseudo selectors
					.replace(/\[([^=]+)=([^\]'"]+)\]/, '[$1="$2"]'); // properly format attribute selectors 
				var array = isAbstract ? abstracts : selectors;
				if (array.indexOf(selector) == -1)
					array.push(selector);
			});
		});

		selectors.sort().forEach(function(selector){
			if (abstracts.indexOf(selector) != -1) // skip abstracts
				return;			
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
								defaults.dataAttr && node.setAttribute('data-selector', substr);
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
			re = new RegExp('^(' + defaults.tags.join('|') + ')$');
			
		for (var i = 0, len = tags.length, tag; i < len; i++){
			if (re.test(tag = tags[i])){
				tag = defaults.expand[tag] || tag;
		 		node.innerHTML = tag.replace(/\b[a-z]/g, function(match){ return match.toUpperCase(); }); // capitalize
				break;
			}
		}
	}
	
	function setdefaults(objA, objB){
		for (var i in objA){
			if (!objB[i] || typeof objA[i] == typeof objB[i]){
				if (typeof objA[i] == 'object')
					setdefaults(objA[i], objB[i]);
				else
					objB[i] = objA[i];
			}
		}
	}
	
	function slice(collection){
		return [].slice.call(collection);
	}

	container[css2html] = function(css, options){
		setdefaults(options || {}, defaults);

		var fragment = parse(css);
		return defaults.out == 'html' ? fragment.innerHTML 
			: slice(fragment.childNodes);
	}
})('css2html', this);