chrome.runtime.onMessage.addListener(({ name, data }) => {
  if (name === 'SpireUpdated') {
    // Hide instructions.
    document.body.querySelector('#debug-required').style.display = 'none';

	if (typeof data === 'string' || data instanceof String){
	    document.body.querySelector('#definition-word').innerText = "message received";
	    document.body.querySelector('#definition-text').innerText = data;
	}
	else{
	    if (Array.isArray(data)){
	      document.body.querySelector('#definition-word').innerText = '';
	      document.body.querySelector('#definition-text').innerHTML = '';
	      data.forEach(x=>{
	        var total=x.stats.reduce((a,c)=>a+c.score,0);
	        x.stats.push({id:'0',name:"Total",score:total});
		var h2 = document.createElement("H2");
		var textNode = document.createTextNode(x.guild);
		h2.appendChild(textNode);
		document.body.querySelector('#definition-text').appendChild(h2);
		document.body.querySelector('#definition-text').appendChild(buildHtmlTable(x.stats));
		document.body.querySelector('#definition-text').appendChild(document.createElement("HR"));
              })
	    }else{
	      var total=data.stats.reduce((a,c)=>a+c.score,0);
	      data.stats.push({id:0,name:"Total",score:total});
	      document.body.querySelector('#definition-word').innerText = data.guild;
	      document.body.querySelector('#definition-text').innerHTML = '';
	      document.body.querySelector('#definition-text').appendChild(buildHtmlTable(data.stats));
            }
	}
  }
});

var _table_ = document.createElement('table'),
  _tr_ = document.createElement('tr'),
  _th_ = document.createElement('th'),
  _td_ = document.createElement('td');

// Builds the HTML Table out of myList json data from Ivy restful service.
// https://stackoverflow.com/a/21065846
function buildHtmlTable(arr) {
  var table = _table_.cloneNode(false),
    columns = addAllColumnHeaders(arr, table);
  for (var i = 0, maxi = arr.length; i < maxi; ++i) {
    var tr = _tr_.cloneNode(false);
    for (var j = 0, maxj = columns.length; j < maxj; ++j) {
      var td = i==maxi-1?_th_.cloneNode(false):_td_.cloneNode(false);
      var cellValue = arr[i][columns[j]];
      td.appendChild(document.createTextNode(arr[i][columns[j]] || ''));
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  return table;
};

// Adds a header row to the table and returns the set of columns.
// Need to do union of keys from all records as some records may not contain
// all records
function addAllColumnHeaders(arr, table) {
  var columnSet = [],
    tr = _tr_.cloneNode(false);
  for (var i = 0, l = arr.length; i < l; i++) {
    for (var key in arr[i]) {
      if (arr[i].hasOwnProperty(key) && columnSet.indexOf(key) === -1) {
        columnSet.push(key);
        var th = _th_.cloneNode(false);
        th.appendChild(document.createTextNode(key));
        tr.appendChild(th);
      }
    }
  }
  table.appendChild(tr);
  return columnSet;
};

function reset(){
       document.body.querySelector('#definition-word').innerText = 'Reload spire to get stats';
       document.body.querySelector('#definition-text').innerText = '';
       chrome.runtime.sendMessage({
         name: 'ResetSpireStats',
         data: ""
        },function (response) {
         if (!chrome.runtime.lastError) {
           // message processing code goes here
         } else {
          // error handling code goes here
         }
       });
};

document.getElementById("resetButton").addEventListener("click", reset);
chrome.runtime.sendMessage({
         name: 'ElvenarSidePanelRefresh',
         data: ""
        },function (response) {
         if (!chrome.runtime.lastError) {
           // message processing code goes here
         } else {
          // error handling code goes here
         }
       });
