const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const dbFile = path.join(__dirname, '.sqlite');
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) console.error('Erreur ouverture DB', err.message);
    else console.log('Connecté à la base de données SQLite.');
});

db.run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY,
    po TEXT,
    project_name TEXT,
    grain TEXT,
    client TEXT,
    machine TEXT,
    priority TEXT,
    date_reception TEXT,
    date_estimee TEXT,
    date_reelle TEXT,
    photo TEXT
)`);

app.get('/api/projects', (req, res) => {
    db.all('SELECT * FROM projects', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/projects', (req, res) => {
    const p = req.body;
    db.get('SELECT id FROM projects WHERE id = ?', [p.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (row) {
            const query = `UPDATE projects SET po=?, project_name=?, grain=?, client=?, machine=?, priority=?, date_reception=?, date_estimee=?, date_reelle=?, photo=? WHERE id=?`;
            db.run(query, [p.po, p.project_name, p.grain, p.client, p.machine, p.priority, p.date_reception, p.date_estimee, p.date_reelle, p.photo, p.id], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true, id: p.id });
            });
        } else {
            const query = `INSERT INTO projects (id, po, project_name, grain, client, machine, priority, date_reception, date_estimee, date_reelle, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            db.run(query, [p.id, p.po, p.project_name, p.grain, p.client, p.machine, p.priority, p.date_reception, p.date_estimee, p.date_reelle, p.photo], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true, id: p.id });
            });
        }
    });
});

app.delete('/api/projects/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM projects WHERE id = ?', id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, deletedID: id });
    });
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});