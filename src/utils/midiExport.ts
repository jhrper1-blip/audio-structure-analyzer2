import MidiWriter from 'midi-writer-js';
import JSZip from 'jszip';

// -------------------- Types --------------------

export interface StructureSection {
  label: string;
  start_time: number;
  end_time: number;
}

export interface AnalysisResult {
  tempo: number;
  structure: StructureSection[];
}

// -------------------- Basic MIDI Export --------------------

export function createMidiFile(result: AnalysisResult): Blob {
  const track = new MidiWriter.Track();
  track.setTempo(result.tempo);
  track.setTimeSignature(4, 4);

  const ticksPerSecond = (480 * result.tempo) / 60;

  result.structure.forEach((section, index) => {
    const startTicks = Math.round(section.start_time * ticksPerSecond);

    track.addEvent(
      new MidiWriter.MetaEvent({
        type: 'marker',
        data: `${section.label} (${formatTime(section.start_time)})`,
        tick: startTicks,
      })
    );

    track.addEvent(
      new MidiWriter.MetaEvent({
        type: 'text',
        data: `Section ${index + 1}: ${section.label} - Duration: ${formatTime(
          section.end_time - section.start_time
        )}`,
        tick: startTicks,
      })
    );
  });

  const last = result.structure[result.structure.length - 1];
  const endTicks = Math.round(last.end_time * ticksPerSecond);

  track.addEvent(
    new MidiWriter.MetaEvent({
      type: 'marker',
      data: `End (${formatTime(last.end_time)})`,
      tick: endTicks,
    })
  );

  const write = new MidiWriter.Writer(track);
  const midiData = write.buildFile();
  const uint8Array = new Uint8Array(midiData);

  return new Blob([uint8Array], { type: 'audio/midi' });
}

export function downloadMidiFile(result: AnalysisResult, originalFilename: string): void {
  try {
    const midiBlob = createMidiFile(result);
    const url = URL.createObjectURL(midiBlob);
    const link = document.createElement('a');

    const baseName = originalFilename.replace(/\.[^/.]+$/, '');
    link.href = url;
    link.download = `${baseName}_structure_markers.mid`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('❌ MIDI export failed:', error);
    throw new Error('Failed to export MIDI file. Please try again.');
  }
}

// -------------------- Ableton Template ZIP Export --------------------

export async function exportAbletonTemplateZip(result: AnalysisResult, filename: string): Promise<void> {
  const zip = new JSZip();
  const baseName = filename.replace(/\.[^/.]+$/, '');
  const folder = zip.folder(baseName) || zip;

  // Add structure markers MIDI file
  const midiBlob = createMidiFile(result);
  folder.file('structure_markers.mid', midiBlob);

  // Add dummy instrument placeholder MIDI files
  const instruments = ['Drums', 'Bass', 'Synth', 'Keys', 'FX'];
  instruments.forEach((name) => {
    const track = new MidiWriter.Track();
    track.setTempo(result.tempo);
    const dummyNote = new MidiWriter.NoteEvent({
      pitch: ['C4'],
      duration: '4',
    });
    track.addEvent(dummyNote);
    const writer = new MidiWriter.Writer([track]);
    folder.file(`${name}.mid`, writer.buildFile());
  });

  // Create and trigger download
  const content = await zip.generateAsync({ type: 'blob' });
  const zipUrl = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = zipUrl;
  link.download = `${baseName}_ableton_template.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(zipUrl);
}

// -------------------- Helpers --------------------

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}