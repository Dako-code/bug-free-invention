# 🚀 GUIDE DE DÉPLOIEMENT COACHPRO
## De zéro à en ligne en 45 minutes

---

## VUE D'ENSEMBLE

Vous allez utiliser 3 services **100% gratuits** :

| Service | Rôle | Gratuit jusqu'à |
|---------|------|-----------------|
| **GitHub** | Stocker votre code | Illimité |
| **Supabase** | Base de données + Authentification | 500 MB, 50 000 utilisateurs |
| **Vercel** | Mettre en ligne l'appli | 100 GB/mois de trafic |

---

## ÉTAPE 1 — CRÉER UN COMPTE GITHUB (5 min)

1. Allez sur **https://github.com**
2. Cliquez **Sign up**
3. Entrez votre email, créez un mot de passe, choisissez un nom d'utilisateur
4. Vérifiez votre email et confirmez votre compte

---

## ÉTAPE 2 — CRÉER UN PROJET SUPABASE (10 min)

### 2.1 Créer le compte
1. Allez sur **https://supabase.com**
2. Cliquez **Start your project** → **Sign up with GitHub** (plus simple)

### 2.2 Créer le projet
1. Cliquez **New project**
2. Remplissez :
   - **Name** : `coachpro`
   - **Database Password** : choisissez un mot de passe fort (notez-le !)
   - **Region** : `West EU (Ireland)` (le plus proche)
3. Cliquez **Create new project** — attendez ~2 minutes

### 2.3 Créer la base de données
1. Dans votre projet Supabase, cliquez **SQL Editor** (icône base de données à gauche)
2. Cliquez **New query**
3. Ouvrez le fichier `src/database.sql` de votre projet CoachPro
4. Copiez TOUT le contenu et collez-le dans l'éditeur SQL
5. Cliquez **Run** (bouton vert) — vous devriez voir "Success"

### 2.4 Récupérer vos clés API
1. Dans Supabase, allez dans **Settings** (engrenage) → **API**
2. Notez ces deux valeurs :
   - **Project URL** → ressemble à `https://abcdefgh.supabase.co`
   - **anon public key** → longue chaîne de caractères

### 2.5 Configurer les clés dans l'appli
1. Ouvrez le fichier `src/supabase.js`
2. Remplacez :
   ```javascript
   const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co'
   // → remplacez par votre vraie Project URL

   const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY'
   // → remplacez par votre vraie anon key
   ```
3. Sauvegardez le fichier

### 2.6 Activer l'authentification email
1. Dans Supabase → **Authentication** → **Providers**
2. Vérifiez que **Email** est activé (il l'est par défaut ✅)
3. Allez dans **Authentication** → **URL Configuration**
4. Dans **Site URL**, mettez temporairement : `http://localhost:3000`
   (vous la changerez après le déploiement Vercel)

---

## ÉTAPE 3 — METTRE LE CODE SUR GITHUB (10 min)

### 3.1 Installer Git (si pas déjà fait)
- **Windows** : Téléchargez sur https://git-scm.com/download/win
- **Mac** : Ouvrez le Terminal et tapez `git --version` (s'installe automatiquement)

### 3.2 Ouvrir un terminal
- **Windows** : Recherchez "Git Bash" ou "Powershell" dans le menu démarrer
- **Mac** : Applications → Utilitaires → Terminal

### 3.3 Mettre le code sur GitHub
Tapez ces commandes une par une dans le terminal :

```bash
# Allez dans le dossier de votre projet
cd /chemin/vers/coachpro
# (Sur Windows : cd C:\Users\VotreNom\Downloads\coachpro)

# Initialisez Git
git init

# Ajoutez tous les fichiers
git add .

# Créez votre premier commit
git commit -m "Premier déploiement CoachPro"

# Allez sur github.com, créez un nouveau repository nommé "coachpro"
# (cliquez le + en haut à droite → New repository → Public → Create)
# Puis copiez les commandes affichées sur la page, elles ressemblent à :

git remote add origin https://github.com/VOTRE_NOM/coachpro.git
git branch -M main
git push -u origin main
```

✅ Votre code est maintenant sur GitHub !

---

## ÉTAPE 4 — DÉPLOYER SUR VERCEL (5 min)

1. Allez sur **https://vercel.com**
2. Cliquez **Sign up** → **Continue with GitHub**
3. Autorisez Vercel à accéder à votre GitHub
4. Cliquez **Add New** → **Project**
5. Trouvez votre repository `coachpro` et cliquez **Import**
6. Laissez tous les paramètres par défaut
7. Cliquez **Deploy** — attendez ~1 minute

🎉 **Votre appli est en ligne !**  
Vercel vous donnera une URL comme : `https://coachpro-abc123.vercel.app`

---

## ÉTAPE 5 — FINALISER LA CONFIGURATION (5 min)

### 5.1 Mettre à jour l'URL dans Supabase
1. Copiez votre URL Vercel (ex: `https://coachpro-abc123.vercel.app`)
2. Dans Supabase → **Authentication** → **URL Configuration**
3. Remplacez `http://localhost:3000` par votre vraie URL Vercel
4. Sauvegardez

### 5.2 Tester votre appli
1. Ouvrez votre URL Vercel dans un navigateur
2. Vous devriez voir la page de connexion CoachPro
3. Créez votre premier compte en cliquant **Inscription**
4. Vérifiez votre email pour confirmer votre compte
5. Connectez-vous → vous êtes dans l'appli !

---

## ÉTAPE 6 — AJOUTER UN NOM DE DOMAINE (optionnel, 15 min)

Si vous voulez une URL pro comme `www.coachpro.fr` :

1. Achetez un domaine sur **OVH** ou **Namecheap** (~10€/an)
2. Dans Vercel → votre projet → **Settings** → **Domains**
3. Cliquez **Add** → entrez votre domaine
4. Suivez les instructions pour configurer les DNS chez votre registrar

---

## PROCHAINES ÉTAPES POUR MONÉTISER

### Ajouter Stripe (paiements réels)

1. Créez un compte sur **https://stripe.com**
2. Récupérez vos clés API dans **Developers** → **API keys**
3. Intégrez Stripe dans votre page de paramètres pour gérer les abonnements

Les plans suggérés (déjà dans votre landing page) :
- **Starter** : Gratuit (1 équipe, 20 joueurs max)
- **Pro** : 9€/mois (3 équipes, joueurs illimités)
- **Club** : 29€/mois (tout illimité)

### Projections de revenus

| Abonnés Pro | Revenu mensuel | Revenu annuel |
|-------------|----------------|---------------|
| 50 coachs | 450€ | 5 400€ |
| 200 coachs | 1 800€ | 21 600€ |
| 500 coachs | 4 500€ | 54 000€ |

---

## RÉSUMÉ DES FICHIERS

```
coachpro/
├── login.html          ← Page de connexion / inscription
├── public/
│   └── index.html      ← L'application principale
├── src/
│   ├── supabase.js     ← Client base de données (à configurer)
│   └── database.sql    ← Schéma SQL (à coller dans Supabase)
├── vercel.json         ← Config de déploiement Vercel
└── GUIDE.md            ← Ce guide
```

---

## AIDE & SUPPORT

Si vous êtes bloqué sur une étape, demandez à Claude en décrivant exactement où vous en êtes.

Bonne chance ! 🚀
