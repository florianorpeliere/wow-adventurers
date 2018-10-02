const express = require('express');
const axios = require('axios');
const router = express.Router();

const characters = ['Yxïon', 'Sämàel', 'Zesstra'];
const local = 'locale=fr_FR';
const realm = 'Dalaran';
const host = 'https://eu.api.battle.net/wow';

const referential = {};

const getReferential = (apiKey) => {
    const races = axios.get(`${host}/data/character/races?${local}&${apiKey}`).then(response => response.data);
    const classes = axios.get(`${host}/data/character/classes?l${local}&${apiKey}`).then(response => response.data);
    Promise.all([races, classes])
        .then(responses => {
            responses.forEach(referentialFromWow => Object.assign(referential, referentialFromWow));
        })
        .catch(err => {
            console.error(err);
            console.error(`We can't load the referential. See errors above`);
            process.exit(1);
        });
}

const enrishResponse = (response) => {
    if(Array.isArray(response)){
        const enrishResponses = response.map(character => {
            const enrishCharacter = Object.assign({}, character);
            if(Number.isInteger(character.class)) { // Is defined
                enrishCharacter.className = referential.classes.filter(({ id }) => id === character.class)[0].name;
            }
            if(Number.isInteger(character.race)) { // Is defined
                enrishCharacter.raceName = referential.races.filter(({ id }) => id === character.race)[0].name;
            }
            return enrishCharacter;
        });

        return enrishResponses;
    }

    return response;
}

/* GET home page. */
module.exports = (app) => {
    const apiKey = `apikey=${app.get('apikey')}`;

    getReferential(apiKey);

    router.get('/characters', (req, res) => {
        const promises = characters.map(character =>
        axios.get(`${host}/character/${realm}/${encodeURIComponent(character)}?${local}&${apiKey}`)
                .then(response => response.data));
        Promise.all(promises)
            .then(responses => {
                const enrishedResponse = enrishResponse(responses);

                res.json(enrishedResponse);
            })
            .catch(err => {
                console.warn(err);
                res.status(500).json({error: 'Internal error'});
            });
    });

    router.get('/characters/professions', (req, res) => {
        const promises = characters.map(character =>
            axios.get(`${host}/character/${realm}/${encodeURIComponent(character)}?fields=professions&${local}&${apiKey}`)
                .then(response => response.data));
        Promise.all(promises)
            .then(responses => {
                responses.forEach(character => {
                    const primaryProfessions = character.professions.primary;
                    character.professions.primary = primaryProfessions.reduce((acc, profession) => {
                        if(!acc[profession.icon]){
                            acc[profession.icon] = []
                        }
                        acc[profession.icon].push(profession);
                        return acc;
                    }, {});
                });
                res.json(responses);
            })
            .catch(err => {
                console.warn(err);
                res.status(500).json({error: 'Internal error'});
            });
    });

    router.get('/referential', (req, res) => {
        res.json(referential);
    });

    return router;
};
