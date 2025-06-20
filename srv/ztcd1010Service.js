module.exports = class ZTCD1010Service extends cds.ApplicationService {

    init() {
        this.on("getZTCD1010DataFunc", async (req) => {
            const { yyyymm } = req.data;

            let dbquery = `Call "check_internal"(IV_YYYYMM => ?)`;
            let data = await cds.run(dbquery, [ yyyymm ]);

            if (data) {
                let result = {
                    data: data.ZTCD1010_DATA
                }
                return result;
            }
            return req.error(404, "Failed to call procedure!");
        })
        return super.init();
    }

}