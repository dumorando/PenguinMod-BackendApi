module.exports = (app, utils) => {
    app.get("/api/v1/users/githubcallback/addpasswordfinal", async function (req, res) {
        const packet = req.query;

        const access_token = packet.at;
        const password = packet.password;

        if (!access_token || !password) {
            utils.error(res, 400, "InvalidData");
            return;
        }

        const user = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${btoa(access_token)}`
            }
        })
        .then(async res => {
            return {"user": await res.json(), "status": res.status};
        });

        if (user.status !== 200) {
            utils.error(res, 500, "InternalError");
            return;
        }

        const userid = await utils.UserManager.getUserIDByOAuthID("scratch", user.user.id);
        const username = await utils.UserManager.getUsernameByID(userid);

        await utils.UserManager.changePassword(username, password);

        const token = await utils.UserManager.newTokenGen(username);

        res.redirect(`/api/v1/users/sendloginsuccess?token=${token}&username=${username}`);
    });
}