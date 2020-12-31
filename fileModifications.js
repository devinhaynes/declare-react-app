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
    },
    {
        name: 'public/index.html',
        singleLineDeletions: [
            '<link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />',
            '<link rel="manifest" href="%PUBLIC_URL%/manifest.json" />',
            '<link rel="icon" href="%PUBLIC_URL%/favicon.ico" />'
        ],
        removeComments: true,
        removeMultiLineComments: true,
        lineEdits: [
            {
                original: '<title>React App</title>',
                replacement: ''
            }
        ]
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

