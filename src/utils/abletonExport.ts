// src/utils/abletonExport.ts
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import MidiWriter from 'midi-writer-js';
import type { AnalysisResult } from './midiExport';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function generateStructureMarkerMIDI(result: AnalysisResult): Uint8Array {
  try {
    const track = new MidiWriter.Track();
    const ticksPerSecond = (480 * result.tempo) / 60;

    result.structure.forEach((section, index) => {
      const startTicks = Math.round(section.start_time * ticksPerSecond);

      track.addEvent(new MidiWriter.MetaEvent({
        type: 'marker',
        data: `${section.label} (${formatTime(section.start_time)})`,
        tick: startTicks
      }));

      track.addEvent(new MidiWriter.MetaEvent({
        type: 'text',
        data: `Section ${index + 1}: ${section.label}`,
        tick: startTicks
      }));
    });

    const writer = new MidiWriter.Writer(track);
    return new Uint8Array(writer.buildFile());
  } catch (err) {
    console.error('🎵 Error creating structure MIDI:', err);
    throw err;
  }
}

function generateDummyTrack(label: string): Uint8Array {
  const track = new MidiWriter.Track();
  track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 1 }));

  // Add a placeholder note
  track.addEvent(new MidiWriter.NoteEvent({
    pitch: ['C4'],
    duration: '4',
    startTick: 0,
  }));

  const writer = new MidiWriter.Writer(track);
  return new Uint8Array(writer.buildFile());
}

export async function exportAbletonTemplateZip(result: AnalysisResult, filename: string) {
  try {
    const zip = new JSZip();
    const baseName = filename.replace(/\.[^/.]+$/, '');

    // Add structure markers MIDI
    const structureMidi = generateStructureMarkerMIDI(result);
    zip.file(`${baseName}_structure_markers.mid`, structureMidi, { binary: true });

    // Add dummy tracks
    const tracks = ['drums', 'bass', 'keys', 'synth'];
    tracks.forEach((trackName) => {
      const midiData = generateDummyTrack(trackName);
      zip.file(`${trackName}.mid`, midiData, { binary: true });
    });

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${baseName}_ableton_template.zip`);
  } catch (err) {
    console.error('❌ Failed to export Ableton ZIP:', err);
    throw new Error('Export failed.');
  }
}