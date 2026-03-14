# Vision IA - Générateur d'Images

Vision IA est une application web moderne et élégante qui permet aux utilisateurs de générer des images uniques à partir de descriptions textuelles (prompts) en utilisant l'intelligence artificielle de Google (Gemini).

## Caractéristiques

- **Génération d'Images IA** : Propulsé par le modèle `gemini-2.5-flash-image`.
- **Interface Sombre** : Design minimaliste et professionnel optimisé pour le confort visuel.
- **Formats Flexibles** : Support des ratios 1:1 (carré), 16:9 (paysage) et 9:16 (portrait).
- **Téléchargement Direct** : Possibilité d'enregistrer les images générées en un clic.
- **Responsive Design** : Entièrement adapté aux mobiles et tablettes.
- **Sans Émojis** : Une interface sobre et textuelle.

## Technologies Utilisées

- **React 19**
- **TypeScript**
- **Tailwind CSS** (Stylisation)
- **Framer Motion** (Animations)
- **Lucide React** (Icônes)
- **Google Generative AI SDK** (@google/genai)
- **Vite** (Outil de build)

## Installation

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/votre-utilisateur/vision-ia-generateur-images.git
   cd vision-ia-generateur-images
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Configurez les variables d'environnement :
   Créez un fichier `.env` à la racine du projet et ajoutez votre clé API Gemini :
   ```env
   VITE_GEMINI_API_KEY=votre_cle_api_ici
   ```

4. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

## Utilisation

1. Entrez une description détaillée de l'image que vous souhaitez créer dans le champ de texte.
2. Sélectionnez le format souhaité (1:1, 16:9 ou 9:16).
3. Cliquez sur "Générer l'image".
4. Une fois l'image affichée, survolez-la ou utilisez le bouton dédié pour la télécharger.

## Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.
