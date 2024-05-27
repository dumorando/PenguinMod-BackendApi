module.exports = (app, utils) => {
    app.post('/api/v1/misc/setProfanityList', async function (req, res) {
        const packet = req.body;

        const username = (String(packet.username)).toLowerCase();
        const token = packet.token;

        if (!await utils.UserManager.loginWithToken(username, token)) {
            utils.error(res, 400, "Reauthenticate")
            return;
        }
        if (!await utils.UserManager.isAdmin(username)) {
            utils.error(res, 403, "FeatureDisabledForThisAccount")
            return;
        }

        const words = packet.json;

        if (typeof words !== 'object') {
            utils.error(res, 400, "InvalidData");
            return;
        }

        const types = ["illegalWords", "illegalWebsites", "spacedOutWordsOnly", "potentiallyUnsafeWords", "potentiallyUnsafeWordsSpacedOut"];
        for (const key in words) {
            // make sure its an array of strings
            if (typeof words[key] !== 'object') {
                utils.error(res, 400, "InvalidData");
                return;
            }
            for (const word of words[key]) {
                if (typeof word !== 'string') {
                    utils.error(res, 400, "InvalidData");
                    return;
                }
            }

            if (!types.includes(key)) {
                utils.error(res, 400, "InvalidData");
                return;
            }
        }

        for (const key in words) {
            await utils.UserManager.setIllegalWords(key, words[key]);
        }
        
        utils.logs.sendAdminLog(
            {
                action: "Profanity list has been set",
                content: `${username} set the profanity list`,
                fields: [
                    {
                        name: "Admin",
                        value: username
                    },
                ]
            },
            {
                name: username,
                icon_url: String("http://localhost:8080/api/v1/users/getpfp?username=" + username),
                url: String("https://penguinmod.com/profile?user=" + username)
            }
        );
        
        res.status(200);
        res.header("Content-Type", 'application/json');
        res.json({ "success": true });
    });
}