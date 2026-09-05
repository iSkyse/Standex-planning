const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Chemin vers le fichier de stockage sur le disque persistant Render
const DATA_FILE = path.join('/data', 'data.json');

// Fonctions de chargement et de sauvegarde
function loadData() {
    try {
        // S'assure que le dossier /data existe (au cas où)
        const dir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        if (fs.existsSync(DATA_FILE)) {
            const rawData = fs.readFileSync(DATA_FILE, 'utf8');
            const data = JSON.parse(rawData);
            return {
                projects: data.projects || [],
                devTextures: data.devTextures || [],
                developers: data.developers && data.developers.length ? data.developers : ['José Silva', 'Rita Dias', 'Cristiana Reis', 'José Pedro']
            };
        }
    } catch (error) {
        console.error("Erreur lors de la lecture du fichier de données :", error);
    }
    return { projects: [], devTextures: [], developers: ['José Silva', 'Rita Dias', 'Cristiana Reis', 'José Pedro'] };
}

function saveData() {
    try {
        const dir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const data = { projects, devTextures, developers };
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error("Erreur lors de l'écriture du fichier de données :", error);
    }
}

// Initialisation des données depuis le disque persistant
let { projects, devTextures, developers } = loadData();

// Route pour récupérer tous les projets
app.get('/api/projects', (req, res) => {
    res.json(projects);
});

// Route pour ajouter ou modifier un projet
app.post('/api/projects', (req, res) => {
    const projectData = req.body;

    if (!projectData.id) {
        projectData.id = Date.now();
    }

    // Assurer des valeurs par défaut valides
    projectData.priority = projectData.priority || 'yellow';
    projectData.photo = projectData.photo || '';
    projectData.date_reelle = projectData.date_reelle || null;

    const index = projects.findIndex(p => p.id === Number(projectData.id));
    if (index !== -1) {
        projects[index] = { ...projects[index], ...projectData };
    } else {
        projects.push(projectData);
    }

    saveData();

    res.json({ success: true, project: projects[index !== -1 ? index : projects.length - 1] });
});

// Route pour supprimer un projet
app.delete('/api/projects/:id', (req, res) => {
    const id = Number(req.params.id);
    projects = projects.filter(p => p.id !== id);
    saveData();
    res.json({ success: true });
});

// Route pour récupérer tous les développements de texture
app.get('/api/development', (req, res) => {
    res.json(devTextures);
});

// Route pour ajouter ou modifier un développement de texture
app.post('/api/development', (req, res) => {
    const devData = req.body;

    if (!devData.id) {
        devData.id = Date.now();
    }

    // Assurer des valeurs par défaut valides
    devData.priority = devData.priority || 'CRITICAL';
    devData.state = devData.state || 'IN PROGRESS';
    devData.approved = devData.approved || 'no';
    devData.date_approval = devData.date_approval || '';

    const index = devTextures.findIndex(d => d.id === Number(devData.id));
    if (index !== -1) {
        devTextures[index] = { ...devTextures[index], ...devData };
    } else {
        devTextures.push(devData);
    }

    saveData();

    res.json({ success: true, development: devTextures[index !== -1 ? index : devTextures.length - 1] });
});

// Route pour supprimer un développement de texture
app.delete('/api/development/:id', (req, res) => {
    const id = Number(req.params.id);
    devTextures = devTextures.filter(d => d.id !== id);
    saveData();
    res.json({ success: true });
});

// Route pour récupérer la liste des développeurs
app.get('/api/developers', (req, res) => {
    res.json(developers);
});

// Route pour ajouter un nouveau développeur
app.post('/api/developers', (req, res) => {
    const name = (req.body.name || '').trim();
    if (!name) {
        return res.status(400).json({ success: false, error: 'Name is required' });
    }
    if (!developers.includes(name)) {
        developers.push(name);
        saveData();
    }
    res.json({ success: true, developers });
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
