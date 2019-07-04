var data = data || { currentNetwork: null, currentOrderId: null, networks: {} };

var logService = (function () {
    return {
        info: function (key, message) {
            console.info(key, message);
        },
        success: function (key, message) {
            console.info(key, message);
        },
        error: function (key, message) {
            console.error(key, message);
        }
    };
})();

var contentService = (function () {

    return {
        isListPage: function (url) {
            return url && url.indexOf('ListOrders') > -1;
        },
        isDetailPage: function (url) {
            return url && url.indexOf('OrderDetail') > -1;
        },
        getOrderId: function (url) {
            var uri = new URL(url.replace('#', '/').replace('/orderId=', '?orderId='));
            var orderId = uri.searchParams.get('orderId');

            return orderId;
        },
        getNetworkCode: function () {
            chrome.tabs.getSelected(null, function (tab) {
                chrome.tabs.sendMessage(tab.id, { type: 'getNetworkCodeRQ' });
            });
        },
        getOrderRows: function () {
            chrome.tabs.getSelected(null, function (tab) {
                chrome.tabs.sendMessage(tab.id, { type: 'getOrderRowsRQ' });
            });
        },
        setOrderState: function (entityId, state) {
            chrome.tabs.getSelected(null, function (tab) {
                chrome.tabs.sendMessage(tab.id, { type: 'setOrderStateRQ', entityId: entityId, state: state });
            });
        }
    };
})();

var orderService = (function () {

    const orderStates = {
        NEW: 'new',
        ALREADY: 'already',
        REQUESTING: 'requesting',
    };

    const apiConfig = {
        baseUri: 'https://e47f9bd6-94dc-4107-908a-3ceae2fcc58d.mock.pstmn.io',
        apiKey: '74c0e69d2ff049df8da848af6f7f61e3'
    }

    function getOrderById(id) {
        var promise = new Promise(function (resolve, reject) {
            var endpoint = apiConfig.baseUri + '/orders/' + id;

            var xhr = new XMLHttpRequest();
            xhr.open('GET', endpoint, true);
            xhr.setRequestHeader('x-api-key', apiConfig.apiKey);
            xhr.onerror = function () {
                reject('Error');
            };
            xhr.onreadystatechange = function () {
                if (this.readyState == 4) {
                    resolve(JSON.parse(xhr.responseText));
                }
            };

            xhr.send();
        });

        return promise;
    }

    function listOrders(rows) {

        rows.forEach(function (row) {

            if (data.networks[data.currentNetwork] && data.networks[data.currentNetwork][row.entityId]) {
                //logService.info('ORDER FOUND ' + row.entityId, data.networks[data.currentNetwork][row.entityId]);
                contentService.setOrderState(row.entityId, data.networks[data.currentNetwork][row.entityId].state);

                return;
            }

            data.networks[data.currentNetwork][row.entityId] = {
                id: row.entityId,
                state: orderStates.REQUESTING
            };

            getOrderById(row.entityId).then(function (response) {

                if (response.status == 200) {
                    data.networks[data.currentNetwork][row.entityId].state = orderStates.ALREADY;

                    //logService.success('ORDER REQUEST ' + row.entityId, response);
                    contentService.setOrderState(row.entityId, orderStates.ALREADY);
                }
                else {
                    data.networks[data.currentNetwork][row.entityId].state = orderStates.NEW;

                    //logService.success('ORDER REQUEST ' + row.entityId, response);
                    contentService.setOrderState(row.entityId, orderStates.NEW);
                }
            }).catch(function (error) {
                logService.error('ORDER REQUEST ' + row.entityId, error);
            });
        });
    }

    function detailOrder(orderId) {
        var promise = new Promise(function (resolve, reject) {
            getOrderById(orderId).then(function (response) {
                resolve({ orderId: data.currentOrderId, state: orderStates.ALREADY });
            }).catch(function (error) {
                resolve({ orderId: data.currentOrderId, state: orderStates.NEW });
            });
        });

        return promise;
    }

    return {
        listOrders: function (rows) {
            listOrders(rows);
        },
        getDetailOrder: function (orderId) {
            return detailOrder(orderId);
        }
    };
})();

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