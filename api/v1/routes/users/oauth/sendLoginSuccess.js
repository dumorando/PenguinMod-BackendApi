module.exports = (app, utils) => {
    app.get("/api/v1/users/sendloginsuccess", async function (req, res) {
        const packet = req.query;

        const token = packet.token;
        const username = packet.username;

        if (!token || !username) {
            utils.error(res, 400, "InvalidData");
            return;
        }

        res.status(200);
        res.header("Content-Type", "text/html");
        res.send("hi");
        //res.sendFile(path.join(utils.homeDir, 'success_local.html')); // TODO: in prod send the non local file
    });
}