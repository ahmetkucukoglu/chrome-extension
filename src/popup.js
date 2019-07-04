document.getElementById('result').innerHTML = 'Loading';

var port = chrome.runtime.connect({ name: "getOrderDetailRQ" });
port.postMessage({});

port.onMessage.addListener(function (msg) {
    document.getElementById('result').innerHTML = JSON.stringify(msg);
});