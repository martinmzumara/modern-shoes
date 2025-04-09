const https = require('https');
const fs = require('fs');
const path = require('path');

const directories = [
    'images/sneakers',
    'images/boots',
    'images/formal',
    'images/sandals'
];

// Create directories if they don't exist
directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                const fileStream = fs.createWriteStream(filepath);
                response.pipe(fileStream);
                fileStream.on('finish', () => {
                    fileStream.close();
                    resolve();
                });
            } else {
                reject(`Failed to download ${url}`);
            }
        }).on('error', reject);
    });
}

async function downloadAllImages() {
    const images = [
        { url: 'https://picsum.photos/800/600?random=1', path: 'images/sneakers/urban-runner-1.jpg' },
        { url: 'https://picsum.photos/800/600?random=2', path: 'images/sneakers/urban-runner-2.jpg' },
        { url: 'https://picsum.photos/800/600?random=3', path: 'images/sneakers/sport-elite-1.jpg' },
        { url: 'https://picsum.photos/800/600?random=4', path: 'images/sneakers/sport-elite-2.jpg' },
        { url: 'https://picsum.photos/800/600?random=5', path: 'images/boots/classic-leather-1.jpg' },
        { url: 'https://picsum.photos/800/600?random=6', path: 'images/boots/classic-leather-2.jpg' },
        { url: 'https://picsum.photos/800/600?random=7', path: 'images/formal/executive-oxford-1.jpg' },
        { url: 'https://picsum.photos/800/600?random=8', path: 'images/formal/executive-oxford-2.jpg' },
        { url: 'https://picsum.photos/800/600?random=9', path: 'images/sandals/summer-comfort-1.jpg' },
        { url: 'https://picsum.photos/800/600?random=10', path: 'images/sandals/summer-comfort-2.jpg' }
    ];

    for (const image of images) {
        console.log(`Downloading ${image.path}...`);
        await downloadImage(image.url, image.path);
    }
}

downloadAllImages().then(() => {
    console.log('All images downloaded successfully!');
}).catch(error => {
    console.error('Error downloading images:', error);
});