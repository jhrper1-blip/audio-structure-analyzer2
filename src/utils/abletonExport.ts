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

  const write = new MidiWriter.Writer(track);
  const midiData = write.buildFile();
  return new Uint8Array(midiData);
}

export async function exportAbletonTemplateZip(result: AnalysisResult, filename: string) {
  const zip = new JSZip();
  const baseName = filename.replace(/\.[^/.]+$/, '');

  // Generate the structure marker MIDI file
  const markerMidi = generateStructureMarkerMIDI(result);
  zip.file(`${baseName}_structure_markers.mid`, markerMidi, { binary: true });

  // Simulate placeholder tracks
  const dummyMidi = new Uint8Array([77, 84, 104, 100, 0, 0, 0, 6]); // 'MThd' header chunk

  zip.file('drums.mid', dummyMidi);
  zip.file('bass.mid', dummyMidi);
  zip.file('keys.mid', dummyMidi);
  zip.file('synth.mid', dummyMidi);

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${baseName}_ableton_template.zip`);
}