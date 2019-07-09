//Google Ad Manager sayfasındaki url değişikliklerini izler
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {

    if (!changeInfo.url)
        return;

    logService.info('PAGE UPDATED', changeInfo.url);

    if (changeInfo.url) {
        contentService.getNetworkCode();
    }

    if (contentService.isDetailPage(changeInfo.url)) {
        data.currentOrderId = contentService.getOrderId(changeInfo.url);
    }
    else if (contentService.isListPage(changeInfo.url)) {
        contentService.getOrderRows();
    }
});

//Content Script'ten Google Ad Manager Network bilgisi alınır
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

    if (request.type === 'getNetworkCodeRS') {
        logService.info('MESSAGE - getNetworkCodeRS', request);

        data.currentNetwork = request.message;

        if (!data.networks[data.currentNetwork]) {
            data.networks[data.currentNetwork] = {};
        }
    }
});

//Content Script'ten Google Ad Manager Orders sayfasındaki siparişler alınır
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

    if (request.type === 'getOrderRowsRS') {
        logService.info('MESSAGE - getOrderRowsRS', request);

        orderService.listOrders(request.message);
    }
});

//Popup ile bağlantı kurulur ve uzantı ikonuna tıklanılma olayı dinlenir
chrome.runtime.onConnect.addListener(function (port) {

    if (port.name != "getOrderDetailRQ")
        return;

    port.onMessage.addListener(function (msg) {

        logService.info('MESSAGE - getOrderDetailRQ', msg);

        orderService.getDetailOrder(data.currentOrderId).then(function (response) {
            port.postMessage(response);
        }).catch(function (error) { });

    });
});