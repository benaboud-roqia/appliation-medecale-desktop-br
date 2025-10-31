# Application Desktop Médicale

Une application desktop complète conçue pour les professionnels de la santé afin de gérer les données des patients, surveiller les signes vitaux via des gants médicaux connectés, effectuer des analyses alimentées par l'IA, et gérer les prescriptions et alertes.

## Fonctionnalités

- **Authentification Utilisateur** : Connexion et inscription sécurisées pour les professionnels médicaux utilisant l'authentification Supabase.
- **Tableau de Bord** : Aperçu des métriques clés, patients récents et statut du système.
- **Gestion des Patients** : Ajouter, consulter, mettre à jour et supprimer des dossiers patients avec des profils détaillés.
- **Connexion aux Gants** : Connecter et surveiller les données des gants médicaux pour des mesures des signes vitaux en temps réel (pression, température, EMG).
- **Analyse IA** : Évaluation automatisée des risques et suggestions de diagnostics basées sur les mesures des patients.
- **Éditeur de Prescriptions** : Créer et gérer les prescriptions des patients avec un éditeur intuitif.
- **Alertes** : Système d'alertes pour les événements critiques et notifications.
- **Paramètres** : Configuration de l'application et préférences utilisateur.

## Technologies Utilisées

- **Frontend** : React 18 avec TypeScript
- **Build Tool** : Vite
- **UI Framework** : Radix UI avec Tailwind CSS
- **Backend/Auth** : Supabase
- **Charts** : Recharts
- **Forms** : React Hook Form
- **Icons** : Lucide React
- **Thèmes** : Next Themes

## Prérequis

- Node.js (version 18 ou supérieure)
- npm ou yarn
- Compte Supabase pour la configuration backend

## Installation

1. **Cloner le dépôt** :
   ```bash
   git clone <repository-url>
   cd "Application Desktop Médicale"
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Configuration Supabase** :
   - Créer un projet Supabase
   - Configurer les variables d'environnement dans un fichier `.env` :
     ```
     VITE_SUPABASE_URL=votre-supabase-url
     VITE_SUPABASE_ANON_KEY=votre-supabase-anon-key
     ```

4. **Lancer l'application en mode développement** :
   ```bash
   npm run dev
   ```

   L'application sera accessible sur `http://localhost:3000`.

## Construction pour la Production

Pour construire l'application pour la production :

```bash
npm run build
```

Les fichiers de build seront générés dans le dossier `build`.

## Structure du Projet

```
src/
├── components/          # Composants React
│   ├── ui/             # Composants UI réutilisables (Radix UI)
│   ├── Dashboard.tsx   # Page du tableau de bord
│   ├── PatientsPage.tsx # Gestion des patients
│   ├── PatientDetails.tsx # Détails d'un patient
│   ├── GloveConnection.tsx # Connexion aux gants
│   ├── AIAnalysis.tsx  # Analyse IA
│   ├── PrescriptionEditor.tsx # Éditeur de prescriptions
│   ├── AlertsPage.tsx  # Page des alertes
│   ├── SettingsPage.tsx # Paramètres
│   └── Sidebar.tsx     # Barre latérale de navigation
├── contexts/           # Contextes React
│   └── AuthContext.tsx # Contexte d'authentification
├── utils/              # Utilitaires
├── supabase/           # Configuration Supabase
├── styles/             # Styles globaux
└── assets/             # Ressources statiques
```

## Utilisation

1. **Connexion** : Utilisez vos identifiants pour vous connecter à l'application.
2. **Navigation** : Utilisez la barre latérale pour naviguer entre les différentes sections.
3. **Gestion des Patients** : Ajoutez de nouveaux patients, consultez leurs profils et mettez à jour leurs informations.
4. **Connexion aux Gants** : Connectez les gants médicaux pour recevoir des données en temps réel.
5. **Analyse IA** : Consultez les analyses automatisées basées sur les données des patients.
6. **Prescriptions** : Créez et gérez les prescriptions médicales.
7. **Alertes** : Surveillez les alertes système et patient.

## Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit vos changements (`git commit -am 'Ajouter une nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## Support

Pour toute question ou problème, veuillez créer une issue sur le dépôt GitHub ou contacter l'équipe de développement.
<img width="3412" height="1960" alt="image" src="https://github.com/user-attachments/assets/36c8492d-480d-443a-8b73-48cac0be4129" />
<img width="3455" height="1965" alt="image" src="https://github.com/user-attachments/assets/2c11d30a-9c61-4581-91a4-dda950de5af4" />
<img width="3455" height="1875" alt="image" src="https://github.com/user-attachments/assets/9f5e3eb2-650b-4d44-bbe7-b5819025ef82" />
<img width="3455" height="1845" alt="image" src="https://github.com/user-attachments/assets/dbb064e6-dfeb-484d-844c-b0ec829b6468" />
<img width="3455" height="1860" alt="image" src="https://github.com/user-attachments/assets/a376c308-caf9-4f1d-9103-c48752586996" />
<img width="3452" height="1870" alt="image" src="https://github.com/user-attachments/assets/3fdc1009-4e03-4468-a9c4-19d96c6936be" />
<img width="1210" height="1622" alt="image" src="https://github.com/user-attachments/assets/a3319d2a-5711-4a77-a837-b134c8b0e97b" />







---

**Note** : Cette application est conçue pour un usage médical professionnel. Assurez-vous de respecter toutes les réglementations locales concernant la confidentialité des données médicales (comme HIPAA, RGPD, etc.).

faites par Benaboud Roqia etudiante en master IA&SD
