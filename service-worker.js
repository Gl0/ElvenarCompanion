var attachedTabIds = [];
chrome.webRequest.onBeforeSendHeaders.addListener(function (tab) {
 if (!attachedTabIds.includes(tab.tabId)) {
  if (tab.url.startsWith('http')&&tab.url.indexOf('elvenar.com/game')!=-1) {
     chrome.debugger.attach({ tabId: tab.tabId }, '1.3', function () {
       chrome.debugger.sendCommand(
         { tabId: tab.tabId },
         'Network.enable',
         {},
         function () {
           if (chrome.runtime.lastError) {
             console.error(chrome.runtime.lastError);
           }
         }
       );
     });
   } else {
     console.log('Debugger can only be attached to HTTP/HTTPS pages.');
   };
  attachedTabIds.push(tab.tabId);
 }
},
 { urls: ['https://*.elvenar.com/game*'] });

chrome.debugger.onEvent.addListener(async function (source, method, params) {
  if (method === 'Network.webSocketFrameReceived') {
    if (params.response.payloadData.indexOf("guild")!=-1){
       var tab=await chrome.tabs.get(source.tabId);
       url = tab.url;
       var stats = await parseMessage(params.response.payloadData,url);
       if (stats!="ok"){
        chrome.runtime.sendMessage({
         name: 'SpireUpdated',
         data: stats
//         data: (stats!="ok")?stats:params.response.payloadData
         },function (response) {
          if (!chrome.runtime.lastError) {
           // message processing code goes here
          } else {
           // error handling code goes here
          }
         });
       }
    }
  }
});

async function parseMessage(message,url){
	var server = new URL(url).hostname.replace('.elvenar.com','');
	if (message.indexOf('X-SocketServer-Method:get-history')!=-1){
		////parse guild member names
		var guildIdx=message.indexOf('guild.')+6;
		var guild=Number(message.substring(guildIdx,message.indexOf('X-Correlation')-1));
		let json=message.substring(message.indexOf('{'),message.lastIndexOf('}')+1);
		let users=JSON.parse(json).payload.users;
		var members=new Map();
		users.forEach(x=>members.set(x.id,x.metadata.public_name));
		var key=server+"_"+guild+'_members';
		await chrome.storage.local.set({[key]: Object.fromEntries(members)}, function(){});
	} else if (message.indexOf('SpireRankingService')!=-1){
		////parse spire contibutions
		var json=message.substring(message.indexOf('['),message.lastIndexOf(']')+1);
		var spireResult=JSON.parse(json)[0].responseData;
		var guild = spireResult.guildId;
		var orbs = spireResult.orbs;
		var players = spireResult.players;
		let saved = await readLocalStorage(server+"_"+guild+"_members");
		var sum=0;
		var spireStats=new Map();
		var members = new Map(Object.entries(saved).map(e=>[+e[0],e[1]]));
		members.forEach((value,key)=>{spireStats.set(key,{name:value,score:0});});
		players.forEach(x=>{spireStats.set(x.playerId,{name:members.get(x.playerId),score:x.guildContribution});sum+=x.guildContribution;});
		spireStats.set(0,{name:'Archive',score:(orbs-sum)});
		await chrome.storage.local.set({[server+"_"+guild+"_stats"]: Object.fromEntries(spireStats)}, function(){});
		var stats=[];
		spireStats.forEach((value,key)=>stats.push({id:key,name:value.name,score:value.score}));
		stats.sort((a,b)=>(a.name=='Archive')?1:((b.name=='Archive')?-1:a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })));
		return {guild:server+"_"+guild,orbs:orbs,stats:stats};
	}
	return "ok";
};

chrome.runtime.onMessage.addListener(async({ name, data }) => {
  if (name === 'ResetSpireStats') {
	var saved = await chrome.storage.local.get();
	var keysToRemove=Object.keys(saved).filter((key)=>key.indexOf('_stats')!=-1);
	await chrome.storage.local.remove(keysToRemove,function(){});
  };
  if (name === 'ElvenarSidePanelRefresh') {
	  var saved = await chrome.storage.local.get();
	  var reportKeys = Object.keys(saved).filter((key)=>key.indexOf('_stats')!=-1);
	  fullStats=[];
	  reportKeys.forEach(key=>{
		  stats=[];
		  Object.keys(saved[key]).forEach(x=>stats.push({id:x,name:saved[key][x].name,score:saved[key][x].score}));
		  stats.sort((a,b)=>(a.name=='Archive')?1:((b.name=='Archive')?-1:a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })));
		  fullStats.push({guild: key.replace('_stats',''),stats: stats});
	  })
       chrome.runtime.sendMessage({
         name: 'SpireUpdated',
         data: fullStats
        },function (response) {
         if (!chrome.runtime.lastError) {
           // message processing code goes here
         } else {
          // error handling code goes here
         }
       });
  }
});

const readLocalStorage = async (key) => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([key], function (result) {
        if (result[key] === undefined) {
          reject();
        } else {
          resolve(result[key]);
        }
      });
    });
};

chrome.action.onClicked.addListener((tab) => {
	(async()=>{
	chrome.tabs.create({url:"sidepanel.html"});
//	chrome.sidePanel.setOptions({
//	  tabId: tab.id,
//	  path: 'sidepanel.html',
//	  enabled: true,
//	})
//	await chrome.sidePanel.open({
//	  tabId: tab.id
//	});
  })();
});