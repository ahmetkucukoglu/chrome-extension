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