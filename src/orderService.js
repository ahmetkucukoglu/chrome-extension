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