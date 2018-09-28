const express = require('express');
const axios = require('axios');
const router = express.Router();

const characters = ['Yxïon', 'Sämàel', 'Zesstra'];
const apiKey = 'apikey=XXX';
const local = 'locale=fr_FR';
const host = 'https://eu.api.battle.net/wow';

/* GET home page. */
router.get('/characters/professions', (req, res) => {
    const promises = characters.map(character =>
        axios.get(`${host}/character/Dalaran/${encodeURIComponent(character)}?fields=professions&${local}&${apiKey}`)
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
    const races = axios.get(`${host}/data/character/races?${local}&${apiKey}`).then(response => response.data);
    const classes = axios.get(`${host}/data/character/classes?l${local}&${apiKey}`).then(response => response.data);
    Promise.all([races, classes])
        .then(responses => {
            const response = {}    opacity: 0.5;
            /* cursor: none; */
            pointer-events: none;
            responses.forEach(referentialFromWow => Object.assign(response, referentialFromWow));
            res.json(response);
        })
        .catch(err => {
            console.warn(err);
            res.status(500).json({error: 'Internal error'});
        });
});

module.exports = router;
