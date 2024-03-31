module.exports = (app, utils) => {
    app.get("/api/v1/users/oauthlogin", async function (req, res) {
        const packet = req.query;

        const state = packet.state;
        const code = packet.code;

        if (!state || !code) {
            utils.error(res, 400, "InvalidData");
            return;
        }

        if (!await utils.UserManager.verifyOAuth2State(state)) {
            utils.error(res, 400, "InvalidData");
            return;
        }

        // now make the request
        const response = await utils.UserManager.makeOAuth2Request(code, "scratch");

        const username = await fetch("https://oauth2.scratch-wiki.info/w/rest.php/soa2/v0/user", {
            headers: {
                Authorization: `Bearer ${btoa(response.access_token)}`
            }
        })
        .then(async res => {
            return {"user": await res.json(), "status": res.status};
        });

        if (username.status !== 200) {
            utils.error(res, 500, "InternalError");
            return;
        }

        res.status(200);
        res.send(JSON.stringify(username));
    });
}