(function(css2html, container){
	function selectorToNodes(selector){
		var tag = selector.match(/^\w+/) || ['div'],
			node = document.createElement(tag[0]),
			id = selector.match(/#(?![^\[]+[\]])([^.:\[]+)/);
		if (id)
			node.id = id[1];
			
		var className = selector.match(/\.(?![^\[]+[\]])[^.:#\[]+/g) || [];
		className = className.join('').replace(/\./g, ' ').trim();
		
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
			array.push(node.cloneNode(false));
		return array;
	}
	
	function toArray(collection){
		return [].slice.call(collection);
	}
	
	container[css2html] = function(css){
		var fragment = document.createElement('div');
		css = css.replace(/\s+/g, ' '); // remove line breaks
		css = css.replace(/\{[^}]*\}/g, '\n'); // separate rules onto their own lines
		css.split('\n').forEach(function(rule){
			rule = rule.replace(/\/\*(.|\n)*?\*\//g, ''); // strip comments
			rule = rule.replace(/\s*([,:>+](?![^\[]+[\]]))\s*/g, '$1'); // normalize whitespace
			rule = rule.trim();
			if (!rule)
				return;
			rule.split(/,(?![^\[]+[\]])/).forEach(function(selector){ // separate by commas
				selector.split(/[+~](?![^\(\[]+[\)\]])/).forEach(function(sibling){ // separate by plus or tilde
					var parentNodes = [fragment],
						len = 0; 
					sibling.split(/[ >](?![^\[]+[\]])/).forEach(function(element){ // sepearet by space or angle bracket
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
		return toArray(fragment.childNodes);
	}
})('css2html', this);