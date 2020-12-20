const filesToEdit = [
    {
        name: 'src/App.js',
        singleLineDeletions: [
            "import logo from './logo.svg';",
        ],
        multiLineDeletions: [
            {
                start: '<header className="App-header">',
                finish: '</header>',
            }
        ]
    },
    {
        name: 'src/index.js',
        singleLineDeletions: [
            "import './index.css';",
            "import reportWebVitals from './reportWebVitals';",
            "reportWebVitals();"
        ],
        removeComments: true
    }
];

const filesToDelete = [
    'src/App.test.js',
    'src/index.css',
    'src/logo.svg',
    'src/reportWebVitals.js',
    'src/setupTests.js',
    'public/logo192.png',
    'public/logo512.png',
    'public/manifest.json',
    'public/robots.txt',
    'public/favicon.ico'];

module.exports = { filesToEdit, filesToDelete };

