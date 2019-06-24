/** Constants **/
const loading = "<div class='loading'></div>";
// Loading animation
const progressBar = "<progress class='prb'></progress>";
// Progressing animation

/** A simple (key, value) interface for indexedDB. **/
/** Source Code: https://github.com/DVLP/localStorageDB **/
!function(){function e(t,o){return n?void(n.transaction("s").objectStore("s").get(t).onsuccess=function(e){var t=e.target.result&&e.target.result.v||null;o(t)}):void setTimeout(function(){e(t,o)},100)}var t=window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB;if(!t)return void console.error("indexDB not supported");var n,o={k:"",v:""},r=t.open("d2",1);r.onsuccess=function(e){n=this.result},r.onerror=function(e){console.error("indexedDB request error"),console.log(e)},r.onupgradeneeded=function(e){n=null;var t=e.target.result.createObjectStore("s",{keyPath:"k"});t.transaction.oncomplete=function(e){n=e.target.db}},window.ldb={get:e,set:function(e,t){o.k=e,o.v=t,n.transaction("s","readwrite").objectStore("s").put(o)}}}();


/** Allekok first page **/
function index(k = "dead") {

    var idx = localStorage.getItem("index"),
	t = document.querySelector("#main"),
	res = "";
    
    t.style.animation = "none";
    void t.offsetWidth;
    // Refreshing `t` element for animation.
    t.innerHTML = loading;

    if( ! index_valid() ) {
        get_index();
	return;
    }

    
    var idx = JSON.parse(idx),
	arr = [];
    
    for(var p = 0; p<idx.length; p++) {

        if(k == idx[p].kind) {
            res += `<div role='button' onclick='poet(${idx[p].id})' class='poet'>
                <img id='${idx[p].id}' src='back.jpg' alt='${idx[p].profname}'>
                <h3 title='${idx[p].profname}'>${idx[p].takh}</h3>
                </div>`;

	    arr.push(idx[p].id);
        }
    }

    var nk = (k == "alive") ? "dead" : "alive",
	nk_title = (k == "alive") ? "شاعیرانی کۆچ‌کردوو" : "شاعیرانی نوێ";
    
    res += `<footer>
            <button type="button" onclick="index('${nk}');">
                ${nk_title}
            </button>
            <button type="button" onclick="bayt()">
                بەیتی کوردی
            </button>
        </footer>`;
    
    t.innerHTML = res;
    t.style.paddingTop = "2em";
    t.style.animation = "fade .2s";

    var location = {ki:"index", kind:k};
    set_location(location);

    poet_imgs(arr);

}

function index_valid() {
    var idx = localStorage.getItem("index");

    if( idx === null ) return false;
    if( ! isJSON(idx) ) return false;
    /*
     * more validation tests.
     */

    return true;
}

function isJSON (json) {
    try {
        JSON.parse(json);
    }
    catch(e) {
        console.log(e);
        return false;
    }

    return true;
}

function get_index() {
    var uri = "https://allekok.com/dev/tools/poet.php?poet=all" + "&preventCache="+Date.now();
    var http = new XMLHttpRequest();
    
    http.open("get" , uri);
    http.onload = function () {
        var res = this.responseText;

        localStorage.setItem("index", res);
        get_index_version();
        index();
    }
    
    http.send();
}

function get_index_version() {
    var uri = "https://allekok.com/desktop/update/index/update-version.txt" + "?preventCache="+Date.now();
    var http = new XMLHttpRequest();
    http.onload = function () {
	localStorage.setItem("index_update_version" , parseInt(this.responseText) );
    }

    http.open("get" , uri );
    http.send();
}

// bayt

function bayt() {
    var idx = localStorage.getItem("index");
    if(idx == null || ! index_valid() ) return;

    poet(73);
}

// poet

function poet(p) {
    var idx = localStorage.getItem("index"),
	t = document.querySelector("#main"),
	res = "",
	_p = p;

    t.style.animation = "none";
    void t.offsetWidth;
    t.innerHTML = loading;

    if(! index_valid()) {
        index();
        return;
    }

    idx = JSON.parse(idx);
    for(var i in idx) {
	if(idx[i].id == p) {
	    p=idx[i];
	    break;
	}
    }

    if(p === null) {
        index();
        return;
    }

    res += `<div>
    <div id='poet_pic'>
    <img id='${_p}' src='back.jpg' alt='${p.profname}'>
    </div>
    <div id='adrs'>
    <div id='current_location'>${p.profname}</div>
    </div>
    <div id='poet_books'>
    <p>
    بەرهەمەکانی
    ${p.profname}:
    </p>`;

    var bks = p.bks;
    for(var b = 0; b < bks.length; b++) {
        res += `<button type='button' onclick='check_books_version(${_p},${b});book(${_p},${b});'>${num_convert((b+1).toString())}. ${bks[b]}`;
	if(localStorage.getItem(`book_${_p}_${b}_update_version`) !== null)
	    res += `<i style='padding:0 .3em;vertical-align:middle;color:#15c314' class='material-icons'>file_download</i>`;
	res += "</button>";
    }

    res += `</div>
    </div>
    <div id='poet_info'>
    <p>
    سەبارەت: 
    </p>`;

    var hdesc = p.hdesc;
    for(var h = 0; h < hdesc.length; h++) {
        res += `<div class='poet_info_row'>${hdesc[h]}</div>`;
    }

    res += `</div>`;
    
    t.innerHTML = res;
    t.style.animation = "fade .2s";

    var location = {ki:"poet",pt:_p};
    set_location(location);

    poet_img(_p);
}

// book

function book(p , b) {
    var localStorage_name = `book_${p}_${b}`;
    var t = document.querySelector("#main");
    t.style.animation = "none";
    void t.offsetWidth;
    t.innerHTML = loading;

    ldb.get(localStorage_name , function(bk) {
	res = "";

	if( bk == null || !isJSON(bk)) {
            get_book(p , b);
	}
	else {

	    var idx = JSON.parse(localStorage.getItem("index"));
            bk = JSON.parse(bk);
	    for(var i in idx) {
		if(idx[i].id == p) {
		    pt=idx[i];
		    break;
		}
	    }

            res += `<div>
          <div id='poet_pic'>
          <img id='${p}' src='back.jpg' alt='${pt.profname}'>
          </div>
          <div id='book_info'>
          <div id='adrs'>
          <button type='button' onclick='poet(${p})'>
          ${bk.poet}
          </button>
          &rsaquo;
          <div id='current_location'>${bk.book}</div>
          </div>
          </div>
          </div>
          <div id='book_poems'>`;

            var poems = bk.poems;

            for(var m = 0; m < poems.length; m++) {
		res += `<button class='pm' type='button' onclick='poem(${p},${b},${m})'>${num_convert(poems[m].id)}. ${poems[m].name}</button>`;
            }

            res += `</div>`;

            t.innerHTML = res;
            t.style.animation = "fade .2s";

            var location = {ki:"book",pt:p,bk:b};
            set_location(location);

            poet_img(p);
	}
    });

}

function get_right_format_book ( b ) {
    return ++b;
}

function get_right_format_poet ( p ) {
    var idx = localStorage.getItem("index");
    idx = JSON.parse(idx);
    return idx[p].id;

}

function get_book(p , b) {
    var t = document.querySelector("#main");
    t.innerHTML = progressBar;
    var prb = document.querySelector(".prb");

    var rb = get_right_format_book (b);

    var uri = `https://allekok.com/dev/tools/poem.php?poet=${p}&book=${rb}&poem=all&html` + "&preventCache="+Date.now();
    var http = new XMLHttpRequest();
    http.open("get", uri);
    http.onprogress = function(pe) {
	var contentLength;
	if (pe.lengthComputable) {
	    contentLength = pe.total;
	} else {
	    contentLength = parseInt(pe.target.getResponseHeader('x-con-len'));
	}
	prb.setAttribute("max", contentLength);
	prb.setAttribute("value", pe.loaded);
    }
    http.onload = function(pe) {
        var localStorage_name = `book_${p}_${b}`;
        ldb.set(localStorage_name, this.responseText);
        get_books_version(p,b);
        book(p , b);
    }

    http.send();
}

function get_books_version( p , b ) {
    var uri = "https://allekok.com/desktop/update/books/update-version.txt" + "?preventCache="+Date.now();
    var http = new XMLHttpRequest();
    http.onload = function () {
	localStorage.setItem(`book_${p}_${b}_update_version` , parseInt(this.responseText) );
    }

    http.open("get" , uri );
    http.send();
}

// poem

function poem (p , b , m) {
    var localStorage_name = `book_${p}_${b}`;

    ldb.get(localStorage_name , function(bk) {
	bk = JSON.parse(bk);
	var pm = bk.poems[m];

	var res = "";
	var t = document.querySelector("#main");
	t.style.animation = "none";
	void t.offsetWidth;

	if(pm == null) {
            book(p,b);
            return;
	}

	var idx = JSON.parse(localStorage.getItem("index"));
	for(var i in idx) {
	    if(idx[i].id == p) {
		var pt=idx[i];
		break;
	    }
	}
	
	res += `<div>
      <div id='poem_info'>
      <div id='poet_pic'>
      <img id='${p}' src='back.jpg' alt='${pt.profname}'>
      </div>
      <div id='adrs'>
      <button type='button' onclick='poet(${p})'>${bk.poet}</button>
      &rsaquo;
      <button type='button' onclick='book(${p},${b})'>${bk.book}</button>
      &rsaquo;
      <div id='current_location'>${num_convert(pm.id)}. ${pm.name}</div>
      </div>
      </div>
      </div>
      <div id='poem_nav'>
      <button type='button' onclick='poem(${p},${b},${m-1})' id='nav_prev'> &lsaquo; </button>
      <button type='button' onclick='poem(${p},${b},${m+1})' id='nav_next'> &rsaquo; </button>
      </div>
      <div id='poem_tools'>
      <button type='button' onclick="save_fs('bigger')" id='fs_bigger'>
      گەورەتر
      </button>
      <button type='button' onclick="save_fs('smaller')" id='fs_smaller'>
      بچوک‌تر
      </button>
      </div>
      <div id='poem_context'>${pm.hon}</div>`;
	if(pm.hdesc != "") {
      	    res += `<div id='poem_desc'>${pm.hdesc}</div>`;
	}

	t.innerHTML = res;
	t.style.animation = "fade .2s";
	get_fs();

	var location = {ki:"poem",pt:p,bk:b,pm:m};
	set_location(location);

	poet_img(p);
    });

}

// check for updates

// update index

// work with this
function check_index_version() {
    var idx = localStorage.getItem("index");
    if( idx == null || ! index_valid() ) return;

    var uri = "https://allekok.com/desktop/update/index/update-version.txt" + "?preventCache="+Date.now();;
    var http = new XMLHttpRequest();
    http.onload = function () {
	var old_ver = localStorage.getItem("index_update_version") || 0;
	var new_ver = parseInt(this.responseText);

	if(old_ver == new_ver)  return;

	update_index(new_ver);
    }

    http.open("get" , uri);
    http.send();
}

function update_index( new_ver ) {
    var uri = `https://allekok.com/dev/tools/poet.php?poet=all` + "&preventCache="+Date.now();
    var http = new XMLHttpRequest();
    http.onload = function() {
	var res = this.responseText;
	localStorage.setItem("index", res);
	localStorage.setItem("index_update_version" , new_ver);
    }

    http.open("get", uri);
    http.send();
}

// work with this
function check_books_version ( p , b ) {
    ldb.get(`book_${p}_${b}` , function(bk){
	if(bk == null)  return;

	var localStorage_name = `book_${p}_${b}_update_version`;
	var old_ver = localStorage.getItem(localStorage_name) || 0;
	var uri = `https://allekok.com/desktop/update/books/update-version.txt` + "?preventCache="+Date.now();
	var http = new XMLHttpRequest();
	http.onload = function () {
	    var new_ver = parseInt(this.responseText);
	    if(old_ver == new_ver)  return;

	    check_book_version( p , b , new_ver , old_ver );
	}
	http.open("get", uri);
	http.send();
    });
}

function check_book_version( p , b , new_ver ,old_ver ) {
    var rb = get_right_format_book(b);
    var uri = `https://allekok.com/desktop/update/books/update-log.php?ver=${old_ver}&pt=${p}&bk=${rb}` + "&preventCache="+Date.now();
    var http = new XMLHttpRequest();

    http.onload = function () {
	if(this.responseText == "true") {
	    update_book(p , b , new_ver);
	}
    }

    http.open("get" , uri);
    http.send();
}

function update_book(p,b,new_ver) {
    var localStorage_baseName = `book_${p}_${b}`;
    var rb = get_right_format_book(b);
    var uri = `https://allekok.com/dev/tools/poem.php?poet=${p}&book=${rb}&poem=all&html` + "&preventCache="+Date.now();
    var http = new XMLHttpRequest();

    http.onload = function () {
	ldb.set(localStorage_baseName , this.responseText);
	localStorage.setItem(`${localStorage_baseName}_update_version` , new_ver);
    }

    http.open("get" , uri);
    http.send();
}

// tools

function poet_imgs ( arr ) {
    arr.forEach(function(p) {
	poet_img(p);
    });
}

function poet_img(p) {
    if(localStorage.getItem("index")==null) return;
    var dist = document.getElementById(`${p}`);

    ldb.get(`img_${p}` , function(img) {

	if(img == null) {
	    get_poet_img(p,dist);
	    var idx = JSON.parse(localStorage.getItem("index"));
	}
	else {
	    dist.src = "data:image/jpeg;base64," + img;
	}
    });

}

function get_poet_img (p,dist) {

    var idx = JSON.parse(localStorage.getItem("index"));
    var uri = `https://allekok.com/dev/tools/img-to-b64.php?pt=${p}` + "&preventCache="+Date.now();
    var http = new XMLHttpRequest();
    http.onload = function () {
	ldb.set(`img_${p}`, this.responseText);
	if(dist !==null) dist.src = "data:image/jpeg;base64," + this.responseText;
	get_poet_img_version();
    }
    http.open("get" , uri);
    http.send();
}

function get_poet_img_version() {
    if(localStorage.getItem(`imgs_update_version`) != null) return;
    var uri = "https://allekok.com/desktop/update/imgs/update-version.txt" + "?preventCache="+Date.now();
    var http = new XMLHttpRequest();
    http.onload = function () {
	localStorage.setItem(`imgs_update_version` , parseInt(this.responseText) );
    }

    http.open("get" , uri );
    http.send();
}

function check_poets_img_update_all () {
    if(localStorage.getItem("imgs_update_version") == null) return;
    var uri = "https://allekok.com/desktop/update/imgs/update-version.txt" + "?preventCache="+Date.now();
    var old_ver = localStorage.getItem("imgs_update_version");
    var idx = JSON.parse(localStorage.getItem("index"));
    var http = new XMLHttpRequest();
    http.onload = function () {
	var new_ver = parseInt(this.responseText);
	if(old_ver != new_ver) {
	    for(var p in idx) {
		check_poet_img_update(idx[p].id , new_ver, old_ver);
	    }
	}
    }
    http.open("get" , uri);
    http.send();
}

function check_poet_img_update(p , new_ver, old_ver) {
    var uri = `https://allekok.com/desktop/update/imgs/update-log.php?ver=${old_ver}&pt=${p}` + "&preventCache="+Date.now();
    var http = new XMLHttpRequest();
    http.onload = function () {
	if(this.responseText == "true") {
	    update_poet_img(p, new_ver);
	}
    }
    http.open("get" , uri);
    http.send();
}

function update_poet_img (p, new_ver) {

    var idx = JSON.parse(localStorage.getItem("index"));
    var uri = `https://allekok.com/dev/tools/img-to-b64.php?pt=${p}` + "&preventCache="+Date.now();
    var http = new XMLHttpRequest();
    http.onload = function () {
	ldb.set(`img_${p}`, this.responseText);
	localStorage.setItem(`imgs_update_version` , new_ver );
    }
    http.open("get" , uri);
    http.send();
}


function num_convert(inp) {

    var en_num = [/0/g,/1/g,/2/g,/3/g,/4/g,/5/g,/6/g,/7/g,/8/g,/9/g];
    var ku_num = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    var ar_num = [/٠/g,/١/g,/٢/g,/٣/g,/٤/g,/٥/g,/٦/g,/٧/g,/٨/g,/٩/g];

    for(var i in en_num) {
        inp = inp.replace(en_num[i] , ku_num[i]);
        inp = inp.replace(ar_num[i] , ku_num[i]);
    }

    return inp;
}


function save_fs(how) {
    // save_fs Function, saves changes of poem's font size into localStorage.

    var hon=document.getElementById("poem_context");
    var fs=parseInt(hon.style.fontSize);
    var wW = window.innerWidth;
    var newfs = 0;
    var hows = ["smaller", "bigger"];
    var scale = 3;

    if(isNaN(fs)){
        if(wW > 600){
            fs=16;
        } else {
            fs=12;
        }
    }
    
    /// make font size bigger
    if(hows.indexOf(how) === 1){
        if(fs >= 120){
            return;
        }
	
	newfs = fs + scale;

	/// make font size smaller
    } else if(hows.indexOf(how) === 0){
        if(fs<=6){
            return;
        }
        newfs = fs - scale;
    }
    
    localStorage.setItem("fontsize", newfs);
    hon.style.fontSize = newfs + "px";
}
function get_fs() {
    var lsfs = localStorage.getItem('fontsize');
    var hhon = document.getElementById('poem_context');
    if (lsfs != null && !isNaN(lsfs) && hhon !=null) {      
	
	hhon.style.fontSize=lsfs+'px';
    }
}

function set_location(obj) {
    obj = JSON.stringify(obj);
    localStorage.setItem("last_location" , obj);
}
function last_location() {
    var ll = localStorage.getItem("last_location");
    if(ll == null)  return;
    ll = JSON.parse(ll);

    if( ll["ki"] == "index" ) {
        index(ll["kind"]);
    }
    else if( ll["ki"] == "poet" ) {
        poet(ll["pt"]);
    }
    else if( ll["ki"] == "book" ) {
        book(ll["pt"] , ll["bk"]);
    }
    else if( ll["ki"] == "poem" ) {
        poem(ll["pt"], ll["bk"], ll["pm"]);
    }
}
