# Audio Structure Analyzer

A beautiful web application that analyzes audio files to detect tempo and song structure using advanced audio processing techniques.

## Features

- **Elegant File Upload**: Drag-and-drop interface supporting MP3 and WAV files
- **Tempo Detection**: Accurate BPM detection using beat tracking algorithms
- **Structure Analysis**: Identifies song sections (Intro, Verse, Chorus, Bridge, Outro) with precise timestamps
- **Modern UI**: Professional design with smooth animations and responsive layout
- **Real-time Processing**: Progress indicators and smooth user experience

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for fast development

### Backend
- **Python 3.8+** with Flask
- **Librosa** for audio analysis
- **NumPy & SciPy** for numerical computations
- **Scikit-learn** for clustering algorithms

## Setup Instructions

### Frontend (Development)
```bash
npm install
npm run dev
```

### Backend (Production)
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Demo Mode (WebContainer)
```bash
# Run the mock server for demonstration
python backend/mock_server.py
```

## How It Works

### Tempo Detection
The application uses Librosa's beat tracking algorithm to analyze the audio signal and detect the dominant tempo in beats per minute (BPM).

### Structure Analysis
1. **Feature Extraction**: Extracts chroma features from the audio signal
2. **Clustering**: Uses agglomerative clustering to group similar musical sections
3. **Labeling**: Applies common song structure labels (Intro, Verse, Chorus, etc.)
4. **Timing**: Converts frame indices to precise timestamps in seconds

### API Endpoints

#### `POST /analyze`
Analyzes an uploaded audio file.

**Request**: Multipart form data with 'audio' file
**Response**: 
```json
{
  "tempo": 128.5,
  "structure": [
    {
      "label": "Intro",
      "start_time": 0.0,
      "end_time": 15.2
    },
    {
      "label": "Verse 1", 
      "start_time": 15.2,
      "end_time": 45.8
    }
  ],
  "duration": 180.5,
  "sample_rate": 44100
}
```

#### `GET /health`
Health check endpoint.

## Deployment

### Production Environment
1. Set up a Python environment with the required dependencies
2. Configure Flask for production (consider using Gunicorn or uWSGI)
3. Build the frontend: `npm run build`
4. Serve the built files through your web server
5. Set up proper CORS configuration for your domain

### Environment Variables
- `FLASK_ENV`: Set to 'production' for production deployment
- `MAX_CONTENT_LENGTH`: Configure maximum file upload size
- `UPLOAD_FOLDER`: Configure temporary file storage location

## File Support

- **MP3**: Standard MPEG audio format
- **WAV**: Uncompressed audio format
- **Maximum Size**: 50MB per file
- **Recommended**: High-quality audio files for best analysis results

## Browser Compatibility

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Performance Notes

- Analysis time depends on file size and duration
- Typical processing time: 2-10 seconds for a 3-4 minute song
- Memory usage scales with file size and sample rate
- For best performance, use audio files with sample rates of 22kHz or 44kHz

## Limitations

- WebContainer demo uses simulated results due to Python library constraints
- Real analysis requires proper Python environment with scientific libraries
- Processing time increases significantly with very long audio files (>10 minutes)
- Structural analysis accuracy depends on musical content and genre

## License

MIT License - see LICENSE file for details.