/* Constants */
const loading = '<div class="loading"></div>',
      progressBar = '<progress class="prb"></progress>'

/* A simple (key, value) interface for indexedDB. */
/* Source Code: https://github.com/DVLP/localStorageDB */
!function(){function e(t,o){return n?void(n.transaction("s").objectStore("s").get(t).onsuccess=function(e){var t=e.target.result&&e.target.result.v||null;o(t)}):void setTimeout(function(){e(t,o)},100)}var t=window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB;if(!t)return void console.error("indexDB not supported");var n,o={k:"",v:""},r=t.open("d2",1);r.onsuccess=function(e){n=this.result},r.onerror=function(e){console.error("indexedDB request error"),console.log(e)},r.onupgradeneeded=function(e){n=null;var t=e.target.result.createObjectStore("s",{keyPath:"k"});t.transaction.oncomplete=function(e){n=e.target.db}},window.ldb={get:e,set:function(e,t){o.k=e,o.v=t,n.transaction("s","readwrite").objectStore("s").put(o)}}}();

/* Functions */
function index(k='dead') {
	const t = document.getElementById('main'),
	      idx = index_valid(),
	      nk = k == 'alive' ? 'dead' : 'alive',
	      nk_title = k == 'alive' ? 'شاعیرانی کۆچ‌کردوو' : 'شاعیرانی نوێ',
	      location = {ki:'index', kind:k};

	let res = '', arr = []
	
	t.innerHTML = loading
	
	if(!idx) {
		get_index()
		return
	}
	
	for(const p of idx) {
		if(k != p.kind)
			continue
		res += `<div role='button' onclick='poet(${p.id})' ` +
			`class='poet'><img id='${p.id}' ` +
			`src='back.webp' alt='${p.profname}'` +
			`><h3 title='${p.profname}'>` +
			`${p.takh}</h3></div>`
		arr.push(p.id)
	}
	res += `<footer>` +
		`<button type="button" onclick="index('${nk}')">` +
		`${nk_title}</button>` +
		`<button type="button" onclick="bayt()">` +
		`بەیتی کوردی` +
		`</button></footer>`
	t.innerHTML = res
	
	set_location(location)
	poet_imgs(arr)
}
function index_valid() {
	return is_json(localStorage.getItem('index'))
}
function is_json(string) {
	try { return JSON.parse(string)	}
	catch(e) { return false	}
}
function get_url(url, callback) {
	const client = new XMLHttpRequest()
	client.open('get', url)
	client.onload = () => callback(client.responseText)
	client.send()
}
function get_index() {
	const url = `${_server}/dev/tools/poet.php?poet=all`
	get_url(url, idx => {
		localStorage.setItem('index', idx)
		get_index_version()
		index()
	})
}
function get_index_version() {
	const url = `${_server}/desktop/update/index/` +
	      `update-version.txt`
	get_url(url, ver => localStorage.setItem('index_update_version',
						parseInt(ver)))
}
function bayt() {
	return poet(73)
}
function poet(p) {
	const idx = index_valid(),
	      t = document.getElementById('main')
	
	let res = ''

	t.innerHTML = loading;
	
	if(!index_valid()) {
		index()
		return
	}

	let _poet
	for(const item of idx) {
		if(item.id == p) {
			_poet = item
			break
		}
	}
	const id = _poet.id,
	      profname = _poet.profname,
	      bks = _poet.bks,
	      hdesc = _poet.hdesc

	res += `<div>` +
		`<div id='poet_pic'>` +
		`<img id='${id}' src='back.webp' alt='${profname}'>` +
		`</div>` +
		`<div id='adrs'>` +
		`<div id='current_location'>${profname}</div>` +
		`</div>` +
		`<div id='poet_books'>` +
		`<p>بەرهەمەکان</p>`
	
	for(let b = 0; b < bks.length; b++) {
		res += `<button type='button' ` +
			`onclick='check_books_version(${id},${b});` +
			`book(${id},${b})'>` +
			`${num_convert(String(b+1))}. ${bks[b]}`
		
		if(localStorage.getItem(
			`book_${id}_${b}_update_version`) !== null) {
			res += `<i style='padding:0 .3em' ` +
				`class='material-icons color-blue'` +
				`>file_download</i>`
		}
		
		res += '</button>'
	}

	res += `</div></div>` +
		`<div id='poet_info'><p>سەبارەت</p>`
	
	for(const h of hdesc)
		res += `<div class='poet_info_row'>${h}</div>`

	res += `</div>`
	
	t.innerHTML = res
	
	set_location({ki: 'poet' , pt: id})
	poet_img(id)
}
function book(p, b) {
	const localStorage_name = `book_${p}_${b}`,
	      t = document.getElementById('main')
	
	t.innerHTML = loading
	
	ldb.get(localStorage_name , bk => {
		let res = ''

		bk = is_json(bk)
		if(!bk) {
			get_book(p, b)
			return
		}

		const idx = index_valid()

		let pt
		for(const item of idx) {
			if(item.id == p) {
				pt = item
				break
			}
		}

		res += `<div>` +
			`<div id='poet_pic'>` +
			`<img id='${p}' src='back.webp' ` +
			`alt='${pt.profname}'>` +
			`</div>` +
			`<div id='book_info'>` +
			`<div id='adrs'>` +
			`<button type='button' onclick='poet(${p})'>` +
			`${bk.poet}</button>` +
			`&rsaquo;` +
			`<div id='current_location'>${bk.book}</div>` +
			`</div></div></div>` +
			`<div id='book_poems'>`

		const poems = bk.poems
		for(let m = 0; m < poems.length; m++) {
			const pid = poems[m].id,
			      name = poems[m].name
			
			res += `<button class='pm' type='button' ` +
				`onclick='poem(${p}, ${b}, ${m})'>` +
				`${num_convert(pid)}. ${name}</button>`
		}
		res += `</div>`

		t.innerHTML = res
		
		set_location({ki: 'book', pt: p, bk: b})
		poet_img(p)
	})
}
function get_right_format_book(b) {
	return 1 + b
}
function get_book(p, b) {
	const t = document.getElementById('main'),
	      rb = get_right_format_book(b),
	      url = `${_server}/dev/tools/poem.php` +
	      `?poet=${p}&book=${rb}&poem=all&html`,
	      http = new XMLHttpRequest
	
	t.innerHTML = progressBar

	const prb = document.querySelector('.prb')
	
	http.open('get', url)
	http.onprogress = pe => {
		let len
		if(pe.lengthComputable)
			len = pe.total
		else
			len = parseInt(pe.target.getResponseHeader(
				'x-con-len'))
		prb.setAttribute('max', len)
		prb.setAttribute('value', pe.loaded)
	}
	http.onload = pe => {
		const localStorage_name = `book_${p}_${b}`
		ldb.set(localStorage_name, http.responseText)
		get_books_version(p, b)
		book(p, b)
	}
	http.send()
}
function get_books_version(p, b) {
	const url = `${_server}/desktop/update/books/` +
	      `update-version.txt`
	get_url(url, res =>
		localStorage.setItem(`book_${p}_${b}_update_version`,
				     parseInt(res)))
}
function poem(p, b, m) {
	const localStorage_name = `book_${p}_${b}`

	ldb.get(localStorage_name, bk => {
		bk = is_json(bk)

		const pm = bk ? bk.poems[m] : false
		const pm_prev = bk.poems[m - 1]
		const pm_next = bk.poems[m + 1]

		if(!pm)
			return

		let res = '', pt
		const t = document.getElementById('main')
		const idx = index_valid()

		for(const item of idx) {
			if(item.id == p) {
				pt = item
				break
			}
		}
		
		res += `<div>` +
			`<div id='poem_info'>` +
			`<div id='poet_pic'>` +
			`<img id='${p}' src='back.webp' ` +
			`alt='${pt.profname}'></div>` +
			`<div id='adrs'>` +
			`<button type='button' onclick='poet(${p})'>` +
			`${bk.poet}</button>` +
			`&rsaquo;` +
			`<button type='button' ` +
			`onclick='book(${p},${b})'>` +
			`${bk.book}</button>` +
			`&rsaquo;` +
			`<div id='current_location'>` +
			`${num_convert(pm.id)}. ${pm.name}</div>` +
			`</div></div></div>` +
			`<div id='poem_nav' style='`
		
		if(!pm_prev && !pm_next)
			res += 'display:none'
		else if(!pm_prev)
			res += 'text-align:left'
		else if(!pm_next)
			res += 'text-align:right'

		res += `'>`
		
		if(pm_prev) {
			res += `<button type='button' ` +
				`onclick='poem(${p}, ${b}, ${m-1})' ` +
				`id='nav_prev'> &lsaquo; ` +
				`${num_convert(pm_prev.id)}. ` +
				`${pm_prev.name}</button>`
		}
		if(pm_next) {
			res += `<button type='button' ` +
				`onclick='poem(${p}, ${b}, ${m+1})' ` +
				`id='nav_next'>` +
				`${num_convert(pm_next.id)}. ` +
				`${pm_next.name} &rsaquo;</button>`
		}
		
		res += `</div>` +
			`<div id='poem_tools'>` +
			`<button type='button' ` +
			`onclick='save_fs("bigger")' id='fs_bigger'` +
			` class='material-icons'>add</button>` +
			`<button type='button' ` +
			`onclick='save_fs("smaller")' ` +
			`id='fs_smaller' class='material-icons'>` +
			`remove</button></div>` +
			`<div id='poem_context'>${pm.hon}</div>`
		
		if(pm.hdesc)
      			res += `<div id='poem_desc'>${pm.hdesc}</div>`

		t.innerHTML = res
		
		get_fs()
		set_location({ki: 'poem', pt: p, bk: b, pm: m})
		poet_img(p)
	})
}
function check_index_version() {
	const idx = index_valid()
	if(!idx)
		return
	const url = `${_server}/desktop/update/index/` +
	      `update-version.txt`
	get_url(url, res => {
		const old_ver = localStorage.getItem(
			'index_update_version') || 0,
		      new_ver = parseInt(res)
		if(old_ver != new_ver)
			update_index(new_ver)
	})
}
function update_index(new_ver) {
	const url = `${_server}/dev/tools/poet.php?poet=all`
	get_url(url, res => {
		localStorage.setItem('index', res)
		localStorage.setItem('index_update_version', new_ver)
	})
}
function check_books_version(p, b) {
	ldb.get(`book_${p}_${b}`, bk => {
		if(bk == null)
			return

		const localStorage_name =
		      `book_${p}_${b}_update_version`
		const old_ver = localStorage.getItem(
			localStorage_name) || 0
		const url = `${_server}/desktop/update/books/` +
		      `update-version.txt`
		
		get_url(url, res => {
			const new_ver = parseInt(res)
			if(old_ver != new_ver)
				check_book_version(
					p, b, new_ver, old_ver)
		})
	})
}
function check_book_version(p, b, new_ver, old_ver) {
	const rb = get_right_format_book(b),
	      url = `${_server}/desktop/update/books/update-log.php` +
	      `?ver=${old_ver}&pt=${p}&bk=${rb}`

	get_url(url, res => {
		if(res == 'true')
			update_book(p, b, new_ver)
	})
}
function update_book(p, b, new_ver) {
	const localStorage_baseName = `book_${p}_${b}`,
	      rb = get_right_format_book(b),
	      url = `${_server}/dev/tools/poem.php` +
	      `?poet=${p}&book=${rb}&poem=all&html`
	
	get_url(url, res => {
		ldb.set(localStorage_baseName, res)
		localStorage.setItem(
			`${localStorage_baseName}_update_version`,
			new_ver)
	})
}
function poet_imgs(arr) {
	arr.map(p => poet_img(p))
}
function poet_img(p) {
	ldb.get(`img_${p}`, img => {
		const dist = document.getElementById(`${p}`)
		if(img == null)
			get_poet_img(p, dist)
		else
			dist.src = 'data:image/jpeg;base64,' + img
	})
}
function get_poet_img(p, dist) {
	const idx = index_valid(),
	      url = `${_server}/dev/tools/img-to-b64.php?pt=${p}`

	get_url(url, res => {
		ldb.set(`img_${p}`, res)
		if(dist !== null)
			dist.src = 'data:image/jpeg;base64,' + res
		get_poet_img_version()
	})
}
function get_poet_img_version() {
	const url = `${_server}/desktop/update/imgs/update-version.txt`
	get_url(url, res => localStorage.setItem(
		'imgs_update_version', parseInt(res)))
}
function check_poets_img_update_all() {
	if(localStorage.getItem('imgs_update_version') === null)
		return
	
	const url = `${_server}/desktop/update/imgs/update-version.txt`
	const old_ver = localStorage.getItem('imgs_update_version')
	const idx = index_valid()
	
	get_url(url, res => {
		const new_ver = parseInt(res)
		if(old_ver != new_ver) {
			for(const p of idx)
				check_poet_img_update(
					p.id, new_ver, old_ver)
		}
	})
}
function check_poet_img_update(p, new_ver, old_ver) {
	const url = `${_server}/desktop/update/imgs/update-log.php` +
	      `?ver=${old_ver}&pt=${p}`
	
	get_url(url, res => {
		if(res == 'true')
			update_poet_img(p, new_ver)
	})
}
function update_poet_img(p, new_ver) {
	const idx = index_valid(),
	      url = `${_server}/dev/tools/img-to-b64.php?pt=${p}`
	
	get_url(url, res => {
		ldb.set(`img_${p}`, res)
		localStorage.setItem('imgs_update_version', new_ver)
	})
}
function num_convert(inp) {
	const en = [/0/g, /1/g, /2/g, /3/g, /4/g,
		    /5/g, /6/g, /7/g, /8/g, /9/g]
	const fa = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g,
		    /۵/g, /۶/g, /۷/g, /۸/g, /۹/g]
	const ck = ['٠', '١', '٢', '٣', '٤',
		    '٥', '٦', '٧', '٨', '٩']
	
	for(const i in en)
		inp = inp.replace(en[i], ck[i]).replace(fa[i], ck[i])
	
	return inp
}
function save_fs(how) {
	const hon = document.getElementById('poem_context'),
	      wW = window.innerWidth,
	      hows = ['smaller', 'bigger'],
	      scale = 2

	let fs = parseInt(hon.style.fontSize)

	if(isNaN(fs))
		fs = 1.3 * (wW > 600 ? 16 : 12)
	
	if(hows.indexOf(how) === 1) {
		/* Bigger */
		if(fs >= 120)
			return
		fs += scale
	} else if(hows.indexOf(how) === 0) {
		/* Smaller */
		if(fs <= 6)
			return
		fs -= scale
	}
	
	localStorage.setItem('fontsize', fs)
	hon.style.fontSize = fs + 'px'
}
function get_fs() {
	const fs = localStorage.getItem('fontsize'),
	      poem = document.getElementById('poem_context')
	if(fs !== null && !isNaN(fs) && poem !== null)
		poem.style.fontSize = fs + 'px'
}
function set_location(obj) {
	localStorage.setItem('last_location', JSON.stringify(obj))
}
function last_location() {
	const loc = is_json(localStorage.getItem('last_location'))

	if(!loc) {
		index()
		return
	}

	const ki = loc['ki']
	if(ki == 'index')
		index(loc['kind'])
	else if(ki == 'poet')
		poet(loc['pt'])
	else if(ki == 'book')
		book(loc['pt'], loc['bk'])
	else if(ki == 'poem')
		poem(loc['pt'], loc['bk'], loc['pm'])
	else
		index()
}
