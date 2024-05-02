module.exports = (app, utils) => {
    app.get("/api/v1/users/googlecallback/addpasswordfinal", async function (req, res) {
        const packet = req.query;

        const tokens = packet.at;
        const password = packet.password;

        if (!tokens || !password) {
            utils.error(res, 400, "InvalidData");
            return;
        }

        const oauth2Client = new utils.googleOAuth2Client(
            utils.env.GoogleOAuthClientID,
            utils.env.GoogleOAuthClientSecret,
            "http://localhost:8080/api/v1/users/googlecallback/addpassword"
        );

        oauth2Client.setCredentials(JSON.parse(tokens));

        const url = 'https://people.googleapis.com/v1/people/me?personFields=names';
        let user;
        try {
            user = await oauth2Client.request({url});
        } catch (e) {
            utils.error(res, 400, "InvalidData");
            return;
        }

        const id = user.data.resourceName.split('/')[1];

        const userid = await utils.UserManager.getUserIDByOAuthID("google", id);

        if (!userid) {
            utils.error(res, 400, "InvalidData");
            return;
        }

        const username = await utils.UserManager.getUsernameByID(userid);

        await utils.UserManager.changePassword(username, password);

        const token = await utils.UserManager.newTokenGen(username);

        res.redirect(`/api/v1/users/sendloginsuccess?token=${token}&username=${username}`);
    });
}