#!/usr/bin/env python3
"""
Audio Analysis Web Backend

- Analyze tempo and structure from audio
- Export structure as JSON or MIDI for DAW use
"""

import os
import tempfile
import numpy as np
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import librosa
import librosa.display
from sklearn.cluster import AgglomerativeClustering
from io import BytesIO
from mido import MidiFile, MidiTrack, MetaMessage, bpm2tempo

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = tempfile.gettempdir()
ALLOWED_EXTENSIONS = {'mp3', 'wav'}
MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB max file size
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def detect_tempo(y, sr):
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    return float(tempo)

def analyze_structure(y, sr, n_segments=6):
    hop_length = 512
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr, hop_length=hop_length)
    chroma_features = chroma.T

    clustering = AgglomerativeClustering(n_clusters=n_segments, linkage='ward')
    segment_labels = clustering.fit_predict(chroma_features)

    times = librosa.frames_to_time(np.arange(len(segment_labels)), sr=sr, hop_length=hop_length)

    segments = []
    current_label = segment_labels[0]
    start_time = times[0]
    section_names = ['Intro', 'Verse', 'Chorus', 'Bridge', 'Verse', 'Outro']

    for i in range(1, len(segment_labels)):
        if segment_labels[i] != current_label or i == len(segment_labels) - 1:
            end_time = times[i] if i < len(times) else times[-1]
            segment_idx = len(segments) % len(section_names)
            label = section_names[segment_idx]

            if label == 'Chorus' and any(s['label'].startswith('Chorus') for s in segments):
                chorus_count = sum(1 for s in segments if 'Chorus' in s['label']) + 1
                label = f'Chorus {chorus_count}'
            elif label == 'Verse' and any(s['label'].startswith('Verse') for s in segments):
                verse_count = sum(1 for s in segments if 'Verse' in s['label']) + 1
                label = f'Verse {verse_count}'

            segments.append({
                'label': label,
                'start_time': float(start_time),
                'end_time': float(end_time)
            })

            current_label = segment_labels[i]
            start_time = times[i] if i < len(times) else times[-1]

    return segments

def structure_to_midi_markers(structure, tempo_bpm):
    mid = MidiFile()
    track = MidiTrack()
    mid.tracks.append(track)

    tempo = bpm2tempo(tempo_bpm)
    track.append(MetaMessage('set_tempo', tempo=tempo, time=0))

    for section in structure:
        time_sec = section['start_time']
        time_ticks = int((time_sec * mid.ticks_per_beat * tempo_bpm) / 60.0)
        track.append(MetaMessage('marker', text=section['label'], time=time_ticks))

    return mid

@app.route('/analyze', methods=['POST'])
def analyze_audio():
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400

        file = request.files['audio']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Upload MP3 or WAV.'}), 400

        ext = file.filename.rsplit('.', 1)[1].lower()
        temp_path = os.path.join(UPLOAD_FOLDER, f"temp_audio_{os.getpid()}.{ext}")
        file.save(temp_path)

        y, sr = librosa.load(temp_path, sr=None)
        tempo = detect_tempo(y, sr)
        structure = analyze_structure(y, sr)

        os.remove(temp_path)

        return jsonify({
            'tempo': tempo,
            'structure': structure,
            'duration': float(len(y) / sr),
            'sample_rate': int(sr)
        })

    except Exception as e:
        return jsonify({'error': f'Audio processing failed: {str(e)}'}), 500

@app.route('/export/json', methods=['POST'])
def export_json():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    file = request.files['audio']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Upload MP3 or WAV.'}), 400

    ext = file.filename.rsplit('.', 1)[1].lower()
    temp_path = os.path.join(UPLOAD_FOLDER, f"temp_{os.getpid()}.{ext}")
    file.save(temp_path)

    try:
        y, sr = librosa.load(temp_path, sr=None)
        structure = analyze_structure(y, sr)
        duration = float(len(y) / sr)

        return jsonify({
            'structure': structure,
            'duration': duration,
            'sample_rate': sr
        })

    except Exception as e:
        return jsonify({'error': f'Export failed: {str(e)}'}), 500

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.route('/export/midi', methods=['POST'])
def export_midi():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    file = request.files['audio']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Upload MP3 or WAV.'}), 400

    ext = file.filename.rsplit('.', 1)[1].lower()
    temp_path = os.path.join(UPLOAD_FOLDER, f"temp_{os.getpid()}.{ext}")
    file.save(temp_path)

    try:
        y, sr = librosa.load(temp_path, sr=None)
        tempo = detect_tempo(y, sr)
        structure = analyze_structure(y, sr)

        midi = structure_to_midi_markers(structure, tempo)
        buffer = BytesIO()
        midi.save(file=buffer)
        buffer.seek(0)

        return send_file(
            buffer,
            as_attachment=True,
            download_name='song_structure.mid',
            mimetype='audio/midi'
        )

    except Exception as e:
        return jsonify({'error': f'MIDI export failed: {str(e)}'}), 500

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Audio Analysis API is running'})

@app.errorhandler(413)
def too_large(e):
    return jsonify({'error': 'File too large. Maximum size is 50MB.'}), 413

if __name__ == '__main__':
    print("Audio Analysis API running...")
    app.run(debug=True, host='0.0.0.0', port=5000)