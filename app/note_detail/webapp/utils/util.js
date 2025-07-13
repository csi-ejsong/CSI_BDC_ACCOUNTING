sap.ui.define([], function () {
    "use strict";

    const Util = {
        async callService(url, method = "GET", param = null, customHeaders = {}) {

            const defaultHeaders = {
                "Content-Type": "application/json",
                ...customHeaders
            };

            const options = {
                method,
                headers: defaultHeaders
            };

            if (param && method !== "GET") {
                options.body = JSON.stringify(param);
            }

            try {
                const response = await fetch(url, options);

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP ${response.status}: ${errorText}`)
                }

                // 응답이 성공이나, 반환값이 없는 경우
                if (response.status == 204) {
                    return response; // ← update 요청 이후엔 이게 정상
                  }

                const contentType = response.headers.get("content-type");

                if (contentType && contentType.includes("application/json")) {
                    return await response.json();
                } else {
                    return await response.text();
                }
            }
            catch (err) {
                throw new Error(`Error Calling ${method} ${url}:`, err);
            }
        }
    }
    return Util;
})
