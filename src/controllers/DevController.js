const axios = require('axios');
const Dev = require('../models/Dev');

module.exports = {
    async store(req, res) {
        const { username } = req.body;

        const userExists = await Dev.findOne({ user: username });

        if (userExists) {
            return res.json(userExists);
        }

        const response = await axios
            .get(`https://api.github.com/users/${username}`)
            .catch(error => {
                if (error.response) {
                    const { status } = error.response;
                    res.status(status).json({
                        message: 'Usuário não encontrado'
                    });
                }
            });

        const { name, bio, avatar_url: avatar } = response.data;

        const dev = await Dev.create({
            name,
            user: username,
            bio,
            avatar
        }).catch(err => {
            if (err.name == 'ValidationError') {
                res.status(422).json(err);
            }
        });

        return res.status(201).json(dev);
    }
};
