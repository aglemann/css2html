// http://www.w3schools.com/cssref/css_selectors.asp

var css, html;

test('class', function(){
	css = '.test1';
	html = css2html(css);	
	equal(html[0].className, 'test1', css);
	
	css = '.test2.test2';
	html = css2html(css);
	equal(html[0].className, 'test2 test2', css);
	
	css = 'div.test3';
	html = css2html(css);
	equal(html[0].className, 'test3', css);
	
	css = 'div.test4#id';
	html = css2html(css);
	equal(html[0].className, 'test4', css);
	
	css = 'div#id.test5';
	html = css2html(css);
	equal(html[0].className, 'test5', css);
	
	css = 'div[className=test6]';
	html = css2html(css);
	equal(html[0].className, 'test6', css);
	
	css = 'div[className=test7].test7';
	html = css2html(css);
	equal(html[0].className, 'test7 test7', css);
	
	css = 'div.test8[className=test8]';
	html = css2html(css);
	equal(html[0].className, 'test8 test8', css);
	
	css = 'div[className=test9][className=test9].test9';
	html = css2html(css);
	equal(html[0].className, 'test9 test9 test9', css);
});

test('id', function(){
	css = '#test1';
	html = css2html(css);	
	equal(html[0].id, 'test1', css);
	
	css = 'div#test2';
	html = css2html(css);
	equal(html[0].id, 'test2', css);
	
	css = 'div.class#test3';
	html = css2html(css);
	equal(html[0].id, 'test3', css);
	
	css = 'div#test4.class';
	html = css2html(css);
	equal(html[0].id, 'test4', css);
	
	css = 'div[id=test5]';
	html = css2html(css);
	equal(html[0].id, 'test5', css);
	
	css = 'div[id=test6].class';
	html = css2html(css);
	equal(html[0].id, 'test6', css);
	
	css = 'div.class[id=test7]';
	html = css2html(css);
	equal(html[0].id, 'test7', css);
	
	css = 'div[id=test8]#test8';
	html = css2html(css);
	equal(html[0].id, 'test8', css);
	
	css = 'div#test9[id=test9]';
	html = css2html(css);
	equal(html[0].id, 'test9', css);
});

test('*', function(){
	css = '*';
	html = css2html(css);	
	equal(html[0].tagName.toLowerCase(), 'div', css);
	
	css = '*.test2';
	html = css2html(css);	
	equal(html[0].tagName.toLowerCase(), 'div', css);
	
	css = '*#test3';
	html = css2html(css);	
	equal(html[0].tagName.toLowerCase(), 'div', css);
	
	css = '*[name=test4]';
	html = css2html(css);	
	equal(html[0].tagName.toLowerCase(), 'div', css);
});

test('element', function(){
	css = 'b';
	html = css2html(css);	
	equal(html[0].tagName.toLowerCase(), 'b', css);	
	
	css = 'br';
	html = css2html(css);	
	equal(html[0].tagName.toLowerCase(), 'br', css);
	
	css = '.class';
	html = css2html(css);	
	equal(html[0].tagName.toLowerCase(), 'div', css);
	
	css = '#id';
	html = css2html(css);	
	equal(html[0].tagName.toLowerCase(), 'div', css);
	
	css = '.class#id';
	html = css2html(css);	
	equal(html[0].tagName.toLowerCase(), 'div', css);
});

test('element,element', function(){
	css = 'b, br';
	html = css2html(css);	
	equal(html.length, 2, css);
	equal(html[0].tagName.toLowerCase(), 'b', css);	
	equal(html[1].tagName.toLowerCase(), 'br', css);
	
	css = 'a, b, br';
	html = css2html(css);	
	equal(html.length, 3, css);
	equal(html[0].tagName.toLowerCase(), 'a', css);	
	equal(html[1].tagName.toLowerCase(), 'b', css);	
	equal(html[2].tagName.toLowerCase(), 'br', css);
});

test('element element', function(){
	css = 'b br';
	html = css2html(css);	
	equal(html.length, 1, css);
	equal(html[0].tagName.toLowerCase(), 'b', css);	
	equal(html[0].firstChild.tagName.toLowerCase(), 'br', css);
	
	css = 'a b br';
	html = css2html(css);	
	equal(html.length, 1, css);
	equal(html[0].tagName.toLowerCase(), 'a', css);	
	equal(html[0].firstChild.tagName.toLowerCase(), 'b', css);
	equal(html[0].firstChild.firstChild.tagName.toLowerCase(), 'br', css);
	
	css = 'a, a b';
	html = css2html(css);	
	equal(html.length, 1, css);	
	equal(html[0].tagName.toLowerCase(), 'a', css);	
	equal(html[0].firstChild.tagName.toLowerCase(), 'b', css);
	
	css = 'a b, a br';
	html = css2html(css);	
	equal(html.length, 1, css);	
	equal(html[0].tagName.toLowerCase(), 'a', css);	
	equal(html[0].childNodes[0].tagName.toLowerCase(), 'b', css);
	equal(html[0].childNodes[1].tagName.toLowerCase(), 'br', css);
	
	css = 'a.class b, a#id b';
	html = css2html(css);	
	equal(html.length, 2, css);	
	equal(html[0].tagName.toLowerCase(), 'a', css);	
	equal(html[0].className, 'class', css);	
	equal(html[0].childNodes[0].tagName.toLowerCase(), 'b', css);
	equal(html[1].tagName.toLowerCase(), 'a', css);	
	equal(html[1].id, 'id', css);	
	equal(html[1].childNodes[0].tagName.toLowerCase(), 'b', css);
});

test('element>element', function(){
	css = 'b>br';
	html = css2html(css);	
	equal(html.length, 1, css);
	equal(html[0].tagName.toLowerCase(), 'b', css);	
	equal(html[0].firstChild.tagName.toLowerCase(), 'br', css);
	
	css = 'a>b>br';
	html = css2html(css);	
	equal(html.length, 1, css);
	equal(html[0].tagName.toLowerCase(), 'a', css);	
	equal(html[0].firstChild.tagName.toLowerCase(), 'b', css);
	equal(html[0].firstChild.firstChild.tagName.toLowerCase(), 'br', css);
	
	css = 'a, a>b';
	html = css2html(css);	
	equal(html.length, 1, css);	
	equal(html[0].tagName.toLowerCase(), 'a', css);	
	equal(html[0].firstChild.tagName.toLowerCase(), 'b', css);
	
	css = 'a>b, a>br';
	html = css2html(css);	
	equal(html.length, 1, css);	
	equal(html[0].tagName.toLowerCase(), 'a', css);	
	equal(html[0].childNodes[0].tagName.toLowerCase(), 'b', css);
	equal(html[0].childNodes[1].tagName.toLowerCase(), 'br', css);
	
	css = 'a.class>b, a#id>b';
	html = css2html(css);	
	equal(html.length, 2, css);	
	equal(html[0].tagName.toLowerCase(), 'a', css);	
	equal(html[0].className, 'class', css);	
	equal(html[0].childNodes[0].tagName.toLowerCase(), 'b', css);
	equal(html[1].tagName.toLowerCase(), 'a', css);	
	equal(html[1].id, 'id', css);	
	equal(html[1].childNodes[0].tagName.toLowerCase(), 'b', css);
});

test('element+element', function(){
	css = 'b+br';
	html = css2html(css);	
	equal(html.length, 2, css);
	equal(html[0].tagName.toLowerCase(), 'b', css);	
	equal(html[1].tagName.toLowerCase(), 'br', css);	
	
	css = 'a+b+br';
	html = css2html(css);	
	equal(html.length, 3, css);
	equal(html[0].tagName.toLowerCase(), 'a', css);	
	equal(html[1].tagName.toLowerCase(), 'b', css);	
	equal(html[2].tagName.toLowerCase(), 'br', css);	
	
	css = 'a, a+b';
	html = css2html(css);	
	equal(html.length, 2, css);	
	equal(html[0].tagName.toLowerCase(), 'a', css);	
	equal(html[1].tagName.toLowerCase(), 'b', css);	
	
	css = 'a+b, a+br';
	html = css2html(css);	
	equal(html.length, 3, css);	
	equal(html[0].tagName.toLowerCase(), 'a', css);	
	equal(html[1].tagName.toLowerCase(), 'b', css);	
	equal(html[2].tagName.toLowerCase(), 'br', css);	
	
	css = 'a.class+b, a#id+b';
	html = css2html(css);	
	equal(html.length, 3, css);	
	equal(html[0].tagName.toLowerCase(), 'a', css);	
	equal(html[0].className, 'class', css);	
	equal(html[1].tagName.toLowerCase(), 'b', css);	
	equal(html[2].tagName.toLowerCase(), 'a', css);	
	equal(html[2].id, 'id', css);
	
	css = 'p:nth-child(2n+1)';
	html = css2html(css);	
	equal(html.length, 3, css);
	equal(html[0].tagName.toLowerCase(), 'p', css);	
	
	css = 'p[title*="1+1"]';
	html = css2html(css);	
	equal(html.length, 1, css);
	equal(html[0].tagName.toLowerCase(), 'p', css);	
});


test('element~element', function(){
	css = 'b~br';
	html = css2html(css);	
	equal(html.length, 2, css);
	equal(html[0].tagName.toLowerCase(), 'b', css);	
	equal(html[1].tagName.toLowerCase(), 'br', css);	
	
	css = 'a~b~br';
	html = css2html(css);	
	equal(html.length, 3, css);
	equal(html[0].tagName.toLowerCase(), 'a', css);	
	equal(html[1].tagName.toLowerCase(), 'b', css);	
	equal(html[2].tagName.toLowerCase(), 'br', css);	
	
	css = 'a, a~b';
	html = css2html(css);	
	equal(html.length, 2, css);	
	equal(html[0].tagName.toLowerCase(), 'a', css);	
	equal(html[1].tagName.toLowerCase(), 'b', css);	
	
	css = 'a~b, a~br';
	html = css2html(css);	
	equal(html.length, 3, css);	
	equal(html[0].tagName.toLowerCase(), 'a', css);	
	equal(html[1].tagName.toLowerCase(), 'b', css);	
	equal(html[2].tagName.toLowerCase(), 'br', css);	
	
	css = 'a.class~b, a#id~b';
	html = css2html(css);	
	equal(html.length, 3, css);	
	equal(html[0].tagName.toLowerCase(), 'a', css);	
	equal(html[0].className, 'class', css);	
	equal(html[1].tagName.toLowerCase(), 'b', css);	
	equal(html[2].tagName.toLowerCase(), 'a', css);	
	equal(html[2].id, 'id', css);	
	
	css = 'p[title~=flower]';
	html = css2html(css);	
	equal(html.length, 1, css);
	equal(html[0].tagName.toLowerCase(), 'p', css);	
	
	css = 'p[title*="1~1"]';
	html = css2html(css);	
	equal(html.length, 1, css);
	equal(html[0].tagName.toLowerCase(), 'p', css);	
});

test('[attribute]', function(){
	css = 'input[checked]';
	html = css2html(css);	
	ok(html[0].checked, css);	
	
	css = 'input[type=checkbox][checked]';
	html = css2html(css);	
	equal(html[0].type, 'checkbox', css);	
	ok(html[0].checked, css);	
	
	css = 'a[href][target=_blank]';
	html = css2html(css);	
	ok(html[0].href, css);	
	equal(html[0].target, '_blank', css);	
	
	css = 'a[title~=flower]';
	html = css2html(css);	
	equal(html[0].title, 'flower', css);	
	
	css = 'a[lang|=en]';
	html = css2html(css);	
	equal(html[0].lang, 'en', css);	
	
	css = 'a[href^="https"]';
	html = css2html(css);	
	ok(/https/.test(html[0].href), css);
	
	css = 'a[href$=".pdf"]';
	html = css2html(css);	
	ok(/\.pdf/.test(html[0].href), css);
	
	css = 'a[href*="w3schools"]';
	html = css2html(css);	
	ok(/w3schools/.test(html[0].href), css);
});

test('nth-child(n)', function(){
	css = 'ul li:nth-child(3)';
	html = css2html(css);	
	equal(html[0].childNodes.length, 4, css);
	
	css = 'ul li:nth-child(2n+1)';
	html = css2html(css);	
	equal(html[0].childNodes.length, 3, css);
	
	css = 'ul li:nth-last-child(3)';
	html = css2html(css);	
	equal(html[0].childNodes.length, 4, css);		
	
	css = 'ul li:nth-last-child(2n+1)';
	html = css2html(css);	
	equal(html[0].childNodes.length, 3, css);		
	
	css = 'ul li:first-child';
	html = css2html(css);	
	equal(html[0].childNodes.length, 2, css);		
	
	css = 'ul li:last-child';
	html = css2html(css);	
	equal(html[0].childNodes.length, 2, css);		
});

test('nth-of-type(n)', function(){
	css = 'ul li:nth-of-type(3)';
	html = css2html(css);	
	equal(html[0].childNodes.length, 4, css);
	
	css = 'ul li:nth-of-type(2n+1)';
	html = css2html(css);	
	equal(html[0].childNodes.length, 3, css);
	
	css = 'ul li:nth-last-of-type(3)';
	html = css2html(css);	
	equal(html[0].childNodes.length, 4, css);		
	
	css = 'ul li:nth-last-of-type(2n+1)';
	html = css2html(css);	
	equal(html[0].childNodes.length, 3, css);		
	
	css = 'ul li:first-child';
	html = css2html(css);	
	equal(html[0].childNodes.length, 2, css);		
	
	css = 'ul li:last-child';
	html = css2html(css);	
	equal(html[0].childNodes.length, 2, css);		
});

test(':enabled', function(){
	css = 'input:enabled';
	html = css2html(css);	
	equal(html[0].tagName.toLowerCase(), 'input', css);	
	ok(!html[0].disabled, css);
});

test(':disabled', function(){
	css = 'input:disabled';
	html = css2html(css);	
	equal(html[0].tagName.toLowerCase(), 'input', css);	
	ok(html[0].disabled, css);
});

test(':checked', function(){
	css = 'input[type=checkbox]:checked';
	html = css2html(css);	
	equal(html[0].tagName.toLowerCase(), 'input', css);	
	equal(html[0].type, 'checkbox', css);	
	ok(html[0].checked, css);
});