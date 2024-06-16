const API_KEY = 'P6sPsoI0Ifpz8gpF5gUQHe3VYFJ2h4Z8'; // Replace with your API Key
const API_SECRET = 'AG8YiC_KMDkEuNXOsRC3OecowEwu_Ysm'; // Replace with your API Secret
const DETECT_API_URL = 'https://api-us.faceplusplus.com/facepp/v3/detect';
const COMPARE_API_URL = 'https://api-us.faceplusplus.com/facepp/v3/compare';

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const resultDiv = document.getElementById('result');

// Access the device camera and stream to video element
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => {
        console.error('Error accessing the camera', err);
    });

document.getElementById('capture').addEventListener('click', () => {
    captureImage();
});

function captureImage() {
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async (blob) => {
        await detectFace(blob);
    }, 'image/jpeg');
}

async function detectFace(imageBlob) {
    const formData = new FormData();
    formData.append('api_key', 'P6sPsoI0Ifpz8gpF5gUQHe3VYFJ2h4Z8');
    formData.append('api_secret', 'AG8YiC_KMDkEuNXOsRC3OecowEwu_Ysm');
    formData.append('image_file', imageBlob);

    try {
        const response = await fetch(DETECT_API_URL, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        const data = await response.json();
        if (data.faces.length === 0) {
            resultDiv.innerHTML = 'No face detected in the captured image.';
            return;
        }

        const faceToken = data.faces[0].face_token;
        compareWithSavedImage(faceToken);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function compareWithSavedImage(faceToken1) {
    const savedImage = document.getElementById('savedImage').files[0];

    if (!savedImage) {
        alert('Please select a saved image to compare.');
        return;
    }

    const formData = new FormData();
    formData.append('api_key', API_KEY);
    formData.append('api_secret', API_SECRET);
    formData.append('image_file2', savedImage);
    formData.append('face_token1', faceToken1);

    try {
        const response = await fetch(COMPARE_API_URL, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        const data = await response.json();
        displayResult(data);
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayResult(data) {
    let resultMessage = '';
    if (data.confidence > 90) {
        resultMessage = `
            <p style="text-align: center;">Confidence: ${data.confidence}% is pretty good</p>
        `;
    } else {
        resultMessage = `
            <p style="text-align: center;>Confidence: ${data.confidence}% is low</p>
        `;
    }

    resultDiv.innerHTML = resultMessage;
}

