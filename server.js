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
                devTextures: data.devTextures || []
            };
        }
    } catch (error) {
        console.error("Erreur lors de la lecture du fichier de données :", error);
    }
    return { projects: [], devTextures: [] };
}

function saveData() {
    try {
        const dir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const data = { projects, devTextures };
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error("Erreur lors de l'écriture du fichier de données :", error);
    }
}

// Initialisation des données depuis le disque persistant
let { projects, devTextures } = loadData();

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

    // Sauvegarde automatique sur le disque persistant
    saveData();

    res.json({ success: true, project: projects[index !== -1 ? index : projects.length - 1] });
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
