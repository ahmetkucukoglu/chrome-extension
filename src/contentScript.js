//Background'dan Google Ad Manager Network talebi alınır
chrome.extension.onMessage.addListener(function (message, sender, sendResponse) {

    if (message.type === 'getNetworkCodeRQ') {
        var metas = Array.prototype.map.call(document.querySelectorAll('meta[name="gwt:property"]'),
            element => ({
                key: element.getAttribute('content').split('=')[0],
                value: element.getAttribute('content').split('=')[1]
            }));

        var meta = metas.filter(meta => meta.key == 'gwtinventory:NETWORK_CODE');

        console.log('MESSAGE - getNetworkCodeRQ', meta);

        chrome.runtime.sendMessage({
            type: 'getNetworkCodeRS',
            message: meta[0].value
        });
    }
});

//Background'dan Google Ad Manager Orders talebi alınır
chrome.extension.onMessage.addListener(function (message, sender, sendResponse) {

    if (message.type === 'getOrderRowsRQ') {
        var result = [];

        var table = document.getElementById('gwt-debug-EntityCellTableWidget-t.order.table-cellTableContent');

        if (table) {
            var rows = table.querySelector('tbody').querySelectorAll('tr');

            rows.forEach(function (row) {
                result.push({
                    entityId: row.getAttribute('__entity_id')
                });
            });
        }

        console.log('MESSAGE - getOrderRowsRQ', result);

        chrome.runtime.sendMessage({
            type: 'getOrderRowsRS',
            message: result
        });
    }
});

//Background'dan Google Ad Manager Orders sayfasındaki ilgili siparişin not kolonu için düzenleme talebi alınır
chrome.extension.onMessage.addListener(function (message, sender, sendResponse) {

    if (message.type === 'setOrderStateRQ') {
        var row = document.getElementById('gwt-debug-EntityCellTableWidget-t.order.table-cellTableContent')
            .querySelector('tbody')
            .querySelector(`tr[__entity_id="${message.entityId}"]`);

        console.log('MESSAGE - setOrderStateRQ', row);

        row.querySelectorAll('td')[12].innerHTML = message.state;
    }
});