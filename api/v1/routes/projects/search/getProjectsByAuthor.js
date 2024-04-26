module.exports = (app, utils) => {
    app.get('/api/v1/projects/getProjectsByAuthor', async (req, res) => {
        const packet = req.query;

        const authorUsername = packet.authorUsername;
        const page = packet.page || 0;

        if (!authorUsername) {
            return utils.error(res, 400, "Missing authorId");
        }

        const projects = await utils.UserManager.getProjectsByAuthor(authorUsername, page, utils.env.PageSize);

        return res.send(projects);
    });
}