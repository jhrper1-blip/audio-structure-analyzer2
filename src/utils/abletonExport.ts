import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import MidiWriter from 'midi-writer-js';
import type { AnalysisResult } from './midiExport';

/**
 * Create a simple MIDI clip with a basic note pattern.
 */
function createTrackMidi(trackName: string): Uint8Array {
  const track = new MidiWriter.Track();
  track.setTempo(120);
  track.setTimeSignature(4, 4);

  let events = [];

  switch (trackName) {
    case 'Drums':
      events = [
        new MidiWriter.NoteEvent({ pitch: ['C2'], duration: '4' }),
        new MidiWriter.NoteEvent({ pitch: ['C2'], duration: '4' }),
        new MidiWriter.NoteEvent({ pitch: ['C2'], duration: '4' }),
        new MidiWriter.NoteEvent({ pitch: ['C2'], duration: '4' }),
      ];
      break;
    case 'Bass':
      events = [
        new MidiWriter.NoteEvent({ pitch: ['E2'], duration: '1' }),
        new MidiWriter.NoteEvent({ pitch: ['G2'], duration: '1' }),
        new MidiWriter.NoteEvent({ pitch: ['A2'], duration: '1' }),
      ];
      break;
    case 'Synth':
      events = [
        new MidiWriter.NoteEvent({ pitch: ['C4', 'E4', 'G4'], duration: '1' }),
        new MidiWriter.NoteEvent({ pitch: ['F4', 'A4', 'C5'], duration: '1' }),
      ];
      break;
    default:
      events = [
        new MidiWriter.NoteEvent({ pitch: ['C4'], duration: '1' }),
      ];
  }

  events.forEach(event => track.addEvent(event));

  const write = new MidiWriter.Writer([track]);
  return new Uint8Array(write.buildFile());
}

/**
 * Main export function for Ableton template-style zip.
 */
export async function exportAbletonTemplateZip(result: AnalysisResult, originalFilename: string) {
  const zip = new JSZip();

  // Add structure markers
  const structure = result.structure.map(
    (s, i) =>
      `${i + 1}. ${s.label}: ${s.start_time.toFixed(2)}s - ${s.end_time.toFixed(2)}s`
  ).join('\n');
  zip.file('structure_markers.txt', structure);

  // Generate simple MIDI files for each virtual instrument
  const tracks = ['Drums', 'Bass', 'Synth'];

  for (const track of tracks) {
    const midiData = createTrackMidi(track);
    zip.file(`${track}.mid`, midiData);
  }

  // Build and download the zip
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const baseName = originalFilename.replace(/\.[^/.]+$/, '');
  saveAs(zipBlob, `${baseName}_ableton_template.zip`);
}