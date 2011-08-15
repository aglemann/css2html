(function(css2html, container){
	function clean(str){
		str = str.replace(/\/\*(.|\n)*?\*\//g, ''); // strip comments
		str = str.replace(/\s*([,:>+])\s*/g, '$1'); // normalize whitespace
		str = str.trim();
		return str;
	}
	
	function selectorToNodes(selector){
		var tag = selector.match(/^\w+/) || ['div'];
		var node = document.createElement(tag[0]);
		
		var id = selector.match(/#([^.:]+)/);
		if (id)
			node.id = id[1];
			
		var classes = selector.match(/\.[^.:#\[]+/g) || [];
		var className = classes.join('').replace(/\./g, ' ').trim();
		
		var attributes = selector.match(/\[[^\]]+\]|:(enabled|disabled|checked)/g) || [];
		attributes.forEach(function(attribute){
			attribute = attribute.replace(/^:|[\[\]'"]/g, ''); // strip colons, brackets and quotes
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
		while (n--)
			array.push(node.cloneNode());
		return array;
	}
	
	function toArray(collection){
		return [].slice.call(collection);
	}
		
	container[css2html] = function(str){
		var fragment = document.createElement('div');
		str = str.replace(/\s+/g, ' '); // remove line breaks
		str = str.replace(/\{[^}]*\}/g, '\n'); // separate rules onto their own lines
		var rules = str.split('\n');
		rules.forEach(function(rule){
			rule = clean(rule);
			if (!rule.length)
				return;
			var selectors = rule.split(',');
			selectors.forEach(function(selector){
				var siblings = selector.split(/[+~](?![^\(\[]+[\)\]])/);
				siblings.forEach(function(sibling){
					var parentNodes = [fragment];
					var len = 0;
					var elements = sibling.split(/\s|>/);
					elements.forEach(function(element){
						len += (len ? 1 : 0) + element.length;
						var nodes = [];
						try {
							nodes = fragment.querySelectorAll(sibling.substr(0, len));
						}
						catch(e){
							console.error(e);
						}
						if (!nodes.length){
							nodes = selectorToNodes(element);
							parentNodes.forEach(function(parentNode){
								nodes.forEach(function(node){
									parentNode.appendChild(node);
								});
							});
						}
						parentNodes = toArray(nodes);
					});
				});
			});
		});
		return fragment.childNodes;
	}
})('css2html', this);